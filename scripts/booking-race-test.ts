type BookingDTO = {
  id: string
  fullName: string
  phoneNumber: string
  date: string
  dateDisplay: string
  timeSlot: string
  timeSlotLabel: string
  courts: number[]
  totalPrice: number
  status: "booked" | "cancelled"
  createdAt: string
}

type ApiError = {
  message?: string
}

const BASE_URL = process.env.BOOKING_TEST_BASE_URL || "http://localhost:3000"
const COURT_COUNT = 10

function toDateValue(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDateVN(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`)
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

async function getAvailability(date: string, timeSlot: string): Promise<BookingDTO[]> {
  const query = new URLSearchParams({ date, timeSlot, mode: "availability" })
  const res = await fetch(`${BASE_URL}/api/bookings?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to load availability: HTTP ${res.status}`)
  }

  return (await res.json()) as BookingDTO[]
}

function pickFirstFreeCourt(bookings: BookingDTO[]): number | null {
  const taken = new Set<number>()
  bookings
    .filter((item) => item.status === "booked")
    .forEach((item) => {
      item.courts.forEach((court) => taken.add(court))
    })

  for (let courtId = 1; courtId <= COURT_COUNT; courtId += 1) {
    if (!taken.has(courtId)) return courtId
  }

  return null
}

async function postBooking(payload: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  let body: BookingDTO | ApiError | null = null
  try {
    body = (await res.json()) as BookingDTO | ApiError
  } catch {
    body = null
  }

  return {
    status: res.status,
    ok: res.ok,
    body,
  }
}

async function main() {
  const targetDate = toDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const targetTimeSlot = process.env.BOOKING_TEST_TIME_SLOT || "17-18"

  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Target date: ${targetDate}`)
  console.log(`Target time slot: ${targetTimeSlot}`)

  const bookings = await getAvailability(targetDate, targetTimeSlot)
  const selectedCourt = pickFirstFreeCourt(bookings)

  if (!selectedCourt) {
    throw new Error("No free court is available for the selected date/time.")
  }

  const dateDisplay = formatDateVN(targetDate)
  const seed = Date.now()
  const basePayload = {
    date: targetDate,
    dateDisplay,
    timeSlot: targetTimeSlot,
    timeSlotLabel: targetTimeSlot,
    courts: [selectedCourt],
    totalPrice: 120000,
  }

  const payload1 = {
    ...basePayload,
    fullName: `Race User 1 ${seed}`,
    phoneNumber: "0912345678",
  }

  const payload2 = {
    ...basePayload,
    fullName: `Race User 2 ${seed}`,
    phoneNumber: "0912345679",
  }

  const [result1, result2] = await Promise.all([postBooking(payload1), postBooking(payload2)])

  console.log("Result #1:", result1.status, result1.body)
  console.log("Result #2:", result2.status, result2.body)

  const statuses = [result1.status, result2.status].sort((a, b) => a - b)
  const isExpected = statuses[0] === 200 && statuses[1] === 409

  if (!isExpected) {
    throw new Error(`Unexpected race result. Expected one 200 and one 409, got ${statuses.join(", ")}`)
  }

  console.log("PASS: Concurrency protection works (one success, one conflict).")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error("FAIL:", message)
  process.exit(1)
})

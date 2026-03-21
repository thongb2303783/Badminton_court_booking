export type BookingStatus = "booked" | "cancelled"

export type BookingRecord = {
  id: string
  fullName: string
  phoneNumber: string
  date: string
  dateDisplay: string
  timeSlot: string
  timeSlotLabel: string
  courts: number[]
  totalPrice: number
  status: BookingStatus
  createdAt: string
}

export class BookingApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "BookingApiError"
    this.status = status
  }
}

export async function loadBookings(filters?: { date?: string; timeSlot?: string }): Promise<BookingRecord[]> {
  const query = new URLSearchParams()
  if (filters?.date) query.set("date", filters.date)
  if (filters?.timeSlot) query.set("timeSlot", filters.timeSlot)

  const res = await fetch(`/api/bookings?${query.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return []
  return (await res.json()) as BookingRecord[]
}

export async function loadBookingAvailability(date: string, timeSlot: string): Promise<BookingRecord[]> {
  const query = new URLSearchParams({ date, timeSlot, mode: "availability" })
  const res = await fetch(`/api/bookings?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!res.ok) return []
  return (await res.json()) as BookingRecord[]
}

export async function createBooking(
  payload: Omit<BookingRecord, "id" | "status" | "createdAt">,
): Promise<BookingRecord> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = "Không thể tạo đơn đặt sân."
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) {
        message = data.message
      }
    } catch {
      // Keep fallback message when response body is not JSON.
    }

    throw new BookingApiError(message, res.status)
  }

  return (await res.json()) as BookingRecord
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRecord[]> {
  if (status !== "cancelled") {
    throw new Error("Only cancelled status is supported.")
  }

  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái đơn.")
  }

  return (await res.json()) as BookingRecord[]
}

export function statusLabel(status: BookingStatus): "Đã đặt sân" | "Đã Hủy" {
  return status === "booked" ? "Đã đặt sân" : "Đã Hủy"
}

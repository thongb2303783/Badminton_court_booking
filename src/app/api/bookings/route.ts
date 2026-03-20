import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

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

const ADMIN_SESSION_COOKIE = "admin_session"

async function isAdminRequest() {
  const cookieStore = await cookies()
  const username = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!username) return false

  const admin = await db.admin.findUnique({ where: { username } })
  return Boolean(admin)
}

function toDTO(item: {
  bookingCode: string
  fullName: string
  phoneNumber: string
  date: string
  dateDisplay: string
  timeSlot: string
  timeSlotLabel: string
  totalPrice: number
  status: "BOOKED" | "CANCELLED"
  createdAt: Date
  courts: Array<{ courtId: number }>
}): BookingDTO {
  return {
    id: item.bookingCode,
    fullName: item.fullName,
    phoneNumber: item.phoneNumber,
    date: item.date,
    dateDisplay: item.dateDisplay,
    timeSlot: item.timeSlot,
    timeSlotLabel: item.timeSlotLabel,
    courts: item.courts.map((c) => c.courtId),
    totalPrice: item.totalPrice,
    status: item.status === "BOOKED" ? "booked" : "cancelled",
    createdAt: item.createdAt.toISOString(),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || undefined
  const timeSlot = searchParams.get("timeSlot") || undefined
  const mode = searchParams.get("mode") || undefined

  const where: { date?: string; timeSlot?: string } = {}
  if (date) where.date = date
  if (timeSlot) where.timeSlot = timeSlot

  const isAdmin = await isAdminRequest()

  // Public availability endpoint must be scoped to a specific date and slot.
  if (!isAdmin && !(mode === "availability" && date && timeSlot)) {
    return NextResponse.json([], { status: 200 })
  }

  const bookings = await db.booking.findMany({
    where,
    include: {
      courts: {
        select: {
          courtId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(bookings.map(toDTO))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string
      phoneNumber?: string
      date?: string
      dateDisplay?: string
      timeSlot?: string
      timeSlotLabel?: string
      courts?: number[]
      totalPrice?: number
    }

    const fullName = (body.fullName || "").trim()
    const phoneNumber = (body.phoneNumber || "").trim()
    const date = body.date || ""
    const dateDisplay = body.dateDisplay || ""
    const timeSlot = body.timeSlot || ""
    const timeSlotLabel = body.timeSlotLabel || ""
    const courts = Array.isArray(body.courts) ? body.courts : []
    const totalPrice = Number(body.totalPrice || 0)

    if (!fullName || !phoneNumber || !date || !timeSlot || courts.length === 0 || totalPrice <= 0) {
      return NextResponse.json({ message: "Dữ liệu đặt sân không hợp lệ." }, { status: 400 })
    }

    const activeConflictCount = await db.bookingCourt.count({
      where: {
        courtId: { in: courts },
        booking: {
          date,
          timeSlot,
          status: "BOOKED",
        },
      },
    })

    if (activeConflictCount > 0) {
      return NextResponse.json({ message: "Một hoặc nhiều sân đã được đặt." }, { status: 409 })
    }

    const bookingCode = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const created = await db.booking.create({
      data: {
        bookingCode,
        fullName,
        phoneNumber,
        date,
        dateDisplay,
        timeSlot,
        timeSlotLabel,
        totalPrice,
        status: "BOOKED",
        courts: {
          create: courts.map((courtId) => ({ courtId })),
        },
      },
      include: {
        courts: {
          select: {
            courtId: true,
          },
        },
      },
    })

    return NextResponse.json(toDTO(created))
  } catch {
    return NextResponse.json({ message: "Không thể tạo đơn đặt sân." }, { status: 500 })
  }
}

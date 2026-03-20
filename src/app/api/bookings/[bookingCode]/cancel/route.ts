import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

const ADMIN_SESSION_COOKIE = "admin_session"

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
}) {
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

async function requireAdmin() {
  const cookieStore = await cookies()
  const username = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!username) return false

  const admin = await db.admin.findUnique({ where: { username } })
  return Boolean(admin)
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ bookingCode: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { bookingCode } = await context.params

  const target = await db.booking.findUnique({ where: { bookingCode } })
  if (!target) {
    return NextResponse.json({ message: "Không tìm thấy đơn đặt sân." }, { status: 404 })
  }

  await db.booking.update({
    where: { bookingCode },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  })

  const all = await db.booking.findMany({
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

  return NextResponse.json(all.map(toDTO))
}

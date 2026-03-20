import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const ADMIN_SESSION_COOKIE = "admin_session"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = (body.username || "").trim()
    const password = body.password || ""

    if (!username || !password) {
      return NextResponse.json(
        { message: "Thiếu tài khoản hoặc mật khẩu." },
        { status: 400 },
      )
    }

    const admin = await db.admin.findUnique({ where: { username } })
    if (!admin || admin.passwordHash !== password) {
      return NextResponse.json(
        { message: "Sai tài khoản hoặc mật khẩu." },
        { status: 401 },
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, admin.username, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch {
    return NextResponse.json({ message: "Không thể xử lý đăng nhập." }, { status: 500 })
  }
}

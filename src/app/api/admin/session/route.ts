import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

const ADMIN_SESSION_COOKIE = "admin_session"

export async function GET() {
  const cookieStore = await cookies()
  const username = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!username) {
    return NextResponse.json({ authenticated: false })
  }

  const admin = await db.admin.findUnique({ where: { username } })
  return NextResponse.json({ authenticated: Boolean(admin), username: admin?.username || null })
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" />
              <path d="M12 2a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" />
            </svg>
          </div>
          <span className="text-xl font-bold text-primary">Lộc Phát</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              pathname === "/" ? "text-primary font-bold" : "text-primary/70"
            }`}
          >
            Trang chủ
          </Link>
          <Link
            href="/dat-san"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              pathname === "/dat-san" ? "text-primary font-bold" : "text-primary/70"
            }`}
          >
            Đặt sân
          </Link>
          <Link
            href="/admin/login"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              pathname.startsWith("/admin") ? "text-primary font-bold" : "text-primary/70"
            }`}
          >
            Quản trị
          </Link>
        </nav>
      </div>
    </header>
  )
}

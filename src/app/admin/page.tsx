"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { isAdminAuthenticated, logoutAdmin } from "@/lib/admin-auth"
import {
  BookingSettings,
  DEFAULT_SETTINGS,
  generateTimeSlots,
  loadSettings,
  resetSettings,
  sanitizeSettings,
  saveSettings,
} from "@/lib/booking-settings"
import { BookingRecord, loadBookings, statusLabel, updateBookingStatus } from "@/lib/bookings"

function getTodayKey() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function AdminPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [filterDate, setFilterDate] = useState(getTodayKey())
  const [filterSlot, setFilterSlot] = useState("")

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const ok = await isAdminAuthenticated()
      if (!ok) {
        router.replace("/admin/login")
        return
      }

      if (!active) return
      setSettings(loadSettings())
      const list = await loadBookings()
      setBookings(list)
      setIsReady(true)
    }

    void checkSession()
    return () => {
      active = false
    }
  }, [router])

  const displaySettings = useMemo(() => sanitizeSettings(settings), [settings])
  const previewSlots = useMemo(() => generateTimeSlots(displaySettings), [displaySettings])

  useEffect(() => {
    if (!filterSlot && previewSlots.length > 0) {
      setFilterSlot(previewSlots[0].id)
    }
  }, [filterSlot, previewSlots])

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const passDate = !filterDate || item.date === filterDate
      const passSlot = !filterSlot || item.timeSlot === filterSlot
      return passDate && passSlot
    })
  }, [bookings, filterDate, filterSlot])

  const courtStatuses = useMemo(() => {
    const map = new Map<number, "booked" | "cancelled" | "available">()
    for (let court = 1; court <= 10; court += 1) {
      map.set(court, "available")
    }

    const sorted = [...filteredBookings].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    for (const booking of sorted) {
      for (const court of booking.courts) {
        if (map.get(court) !== "available") continue
        map.set(court, booking.status === "booked" ? "booked" : "cancelled")
      }
    }

    return Array.from(map.entries()).map(([court, status]) => ({ court, status }))
  }, [filteredBookings])

  const updateSettings = (key: keyof BookingSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Number(value) || 0,
    }))
    setSaved(false)
  }

  const handleSave = () => {
    const next = saveSettings(settings)
    setSettings(next)
    setSaved(true)
  }

  const handleReset = () => {
    setSettings(resetSettings())
    setSaved(true)
  }

  const handleLogout = async () => {
    await logoutAdmin()
    router.replace("/admin/login")
  }

  const handleCancelBooking = async (bookingId: string) => {
    const next = await updateBookingStatus(bookingId, "cancelled")
    setBookings(next)
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-primary/70">Đang kiểm tra quyền truy cập...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-primary">Trang quản trị cài đặt</h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dat-san">Xem trang đặt sân</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>Đăng xuất</Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Cài đặt giá và khung giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="openHour">Giờ mở cửa</Label>
                  <Input id="openHour" type="number" min={0} max={23} value={settings.openHour} onChange={(e) => updateSettings("openHour", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeHour">Giờ đóng cửa</Label>
                  <Input id="closeHour" type="number" min={1} max={24} value={settings.closeHour} onChange={(e) => updateSettings("closeHour", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotDuration">Độ dài khung giờ (giờ)</Label>
                  <Input id="slotDuration" type="number" min={1} max={4} value={settings.slotDuration} onChange={(e) => updateSettings("slotDuration", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peakStartHour">Bắt đầu giờ cao điểm</Label>
                  <Input id="peakStartHour" type="number" min={0} max={24} value={settings.peakStartHour} onChange={(e) => updateSettings("peakStartHour", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowHourPrice">Giá giờ thường (VND/giờ)</Label>
                  <Input id="lowHourPrice" type="number" min={0} value={settings.lowHourPrice} onChange={(e) => updateSettings("lowHourPrice", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peakHourPrice">Giá giờ cao điểm (VND/giờ)</Label>
                  <Input id="peakHourPrice" type="number" min={0} value={settings.peakHourPrice} onChange={(e) => updateSettings("peakHourPrice", e.target.value)} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button onClick={handleSave}>Lưu cài đặt</Button>
                <Button variant="outline" onClick={handleReset}>Khôi phục mặc định</Button>
                {saved && <span className="text-sm text-primary/70">Đã lưu cài đặt thành công.</span>}
              </div>

              <div className="mt-5 rounded-lg bg-primary/5 p-4 text-sm text-primary/80">
                <p>
                  Khung giờ hiện tại: {displaySettings.openHour}:00 - {displaySettings.closeHour}:00, mỗi khung {displaySettings.slotDuration} giờ.
                </p>
                <p>
                  Giá thường: {displaySettings.lowHourPrice.toLocaleString("vi-VN")}đ/giờ, cao điểm từ {displaySettings.peakStartHour}:00: {displaySettings.peakHourPrice.toLocaleString("vi-VN")}đ/giờ.
                </p>
                <p className="mt-2">
                  Danh sách khung giờ: {previewSlots.map((slot) => slot.label).join(" | ")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-primary">Danh sách đơn đặt sân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="filterDate">Lọc theo ngày</Label>
                  <Input id="filterDate" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterSlot">Lọc theo khung giờ</Label>
                  <select
                    id="filterSlot"
                    value={filterSlot}
                    onChange={(e) => setFilterSlot(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3"
                  >
                    <option value="">Tất cả khung giờ</option>
                    {previewSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-md border">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-primary/5 text-left">
                    <tr>
                      <th className="px-3 py-2">Mã đơn</th>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Điện thoại</th>
                      <th className="px-3 py-2">Ngày</th>
                      <th className="px-3 py-2">Khung giờ</th>
                      <th className="px-3 py-2">Sân</th>
                      <th className="px-3 py-2">Trạng thái</th>
                      <th className="px-3 py-2">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-primary/70" colSpan={8}>Chưa có đơn phù hợp bộ lọc.</td>
                      </tr>
                    )}
                    {filteredBookings.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">{item.id}</td>
                        <td className="px-3 py-2">{item.fullName}</td>
                        <td className="px-3 py-2">{item.phoneNumber}</td>
                        <td className="px-3 py-2">{item.dateDisplay}</td>
                        <td className="px-3 py-2">{item.timeSlotLabel}</td>
                        <td className="px-3 py-2">{item.courts.map((c) => `Sân ${c}`).join(", ")}</td>
                        <td className="px-3 py-2">
                          <Badge variant={item.status === "booked" ? "default" : "secondary"}>
                            {statusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={item.status === "cancelled"}
                            onClick={() => handleCancelBooking(item.id)}
                          >
                            Hủy đơn
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-primary">Trạng thái sân theo bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {courtStatuses.map((item) => {
                  const label = item.status === "booked"
                    ? "Đã đặt sân"
                    : item.status === "cancelled"
                      ? "Đã Hủy"
                      : "Chưa đặt"

                  const className = item.status === "booked"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : item.status === "cancelled"
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700"

                  return (
                    <div key={item.court} className={`rounded-md border px-3 py-2 ${className}`}>
                      <p className="font-semibold">Sân {item.court}</p>
                      <p className="text-xs">{label}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

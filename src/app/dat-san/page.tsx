"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  BookingSettings,
  DEFAULT_SETTINGS,
  generateTimeSlots,
  getPrice,
  getSlotLabel,
  loadSettings,
  sanitizeSettings,
} from "@/lib/booking-settings"
import { BookingRecord, loadBookingAvailability } from "@/lib/bookings"

const COURTS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Sân ${i + 1}`,
}))

function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function toDateValue(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function getHourlyRateByHour(hour: number, settings: BookingSettings) {
  return hour >= settings.peakStartHour ? settings.peakHourPrice : settings.lowHourPrice
}

export default function BookingPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS)
  const [selectedDate, setSelectedDate] = useState(toDateValue(new Date()))
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedCourts, setSelectedCourts] = useState<number[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])

  const displaySettings = useMemo(() => sanitizeSettings(settings), [settings])
  const timeSlots = useMemo(() => generateTimeSlots(displaySettings), [displaySettings])
  const minDate = useMemo(() => toDateValue(new Date()), [])

  const selectedDateDisplay = useMemo(() => {
    if (!selectedDate) return ""
    const parsed = new Date(`${selectedDate}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return ""
    return formatDate(parsed)
  }, [selectedDate])

  const selectedSlot = useMemo(
    () => timeSlots.find((slot) => slot.id === selectedTimeSlot) ?? null,
    [selectedTimeSlot, timeSlots],
  )

  const selectedSlotPricePerCourt = useMemo(() => {
    if (!selectedTimeSlot) return 0
    return getPrice(selectedTimeSlot, timeSlots, displaySettings)
  }, [displaySettings, selectedTimeSlot, timeSlots])

  const selectedSlotRateText = useMemo(() => {
    if (!selectedSlot) return ""
    const hourlyRates = [] as number[]
    for (let hour = selectedSlot.start; hour < selectedSlot.end; hour += 1) {
      hourlyRates.push(getHourlyRateByHour(hour, displaySettings))
    }
    const uniqueRates = Array.from(new Set(hourlyRates))
    if (uniqueRates.length === 1) {
      return `${uniqueRates[0].toLocaleString("vi-VN")}đ/giờ x ${selectedSlot.end - selectedSlot.start} giờ`
    }
    return `${displaySettings.lowHourPrice.toLocaleString("vi-VN")}đ-${displaySettings.peakHourPrice.toLocaleString("vi-VN")}đ/giờ (theo giờ cao điểm)`
  }, [displaySettings, selectedSlot])

  const bookedCourtsSet = useMemo(() => {
    const set = new Set<number>()
    if (!selectedDate || !selectedTimeSlot) return set

    bookings
      .filter(
        (item) =>
          item.date === selectedDate &&
          item.timeSlot === selectedTimeSlot &&
          item.status === "booked",
      )
      .forEach((item) => {
        item.courts.forEach((court) => set.add(court))
      })

    return set
  }, [bookings, selectedDate, selectedTimeSlot])

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedTimeSlot) {
      setBookings([])
      return
    }

    let active = true
    const run = async () => {
      const list = await loadBookingAvailability(selectedDate, selectedTimeSlot)
      if (active) setBookings(list)
    }

    void run()
    return () => {
      active = false
    }
  }, [selectedDate, selectedTimeSlot])

  useEffect(() => {
    if (selectedTimeSlot && !timeSlots.some((slot) => slot.id === selectedTimeSlot)) {
      setSelectedTimeSlot(null)
      setSelectedCourts([])
    }
  }, [selectedTimeSlot, timeSlots])

  const isSlotBooked = (courtId: number, timeSlot: string) => {
    if (!selectedDate) return false
    return bookings.some(
      (item) =>
        item.date === selectedDate &&
        item.timeSlot === timeSlot &&
        item.status === "booked" &&
        item.courts.includes(courtId),
    )
  }

  const toggleCourt = (courtId: number) => {
    if (!selectedTimeSlot) return
    if (isSlotBooked(courtId, selectedTimeSlot)) return

    setSelectedCourts((prev) =>
      prev.includes(courtId)
        ? prev.filter((id) => id !== courtId)
        : [...prev, courtId],
    )
  }

  const totalPrice = useMemo(() => {
    if (!selectedTimeSlot) return 0
    return selectedCourts.length * getPrice(selectedTimeSlot, timeSlots, displaySettings)
  }, [displaySettings, selectedCourts, selectedTimeSlot, timeSlots])

  const handleBooking = () => {
    if (!selectedTimeSlot || selectedCourts.length === 0 || !selectedDateDisplay || !selectedDate) return

    const bookingData = {
      date: selectedDate,
      dateDisplay: selectedDateDisplay,
      timeSlot: selectedTimeSlot,
      timeSlotLabel: getSlotLabel(selectedTimeSlot, timeSlots),
      courts: selectedCourts.sort((a, b) => a - b),
      totalPrice,
    }

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData))
    router.push("/thanh-toan")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-3xl font-bold text-primary">Đặt Sân Cầu Lông</h1>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <CalendarDays className="h-5 w-5" />
                Chọn ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setSelectedCourts([])
                }}
              />
              <p className="mt-2 text-sm text-primary/70">
                Chỉ có thể đặt từ hôm nay trở đi.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Clock className="h-5 w-5" />
                Chọn khung giờ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                    className={selectedTimeSlot === slot.id
                      ? "bg-primary text-primary-foreground"
                      : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}
                    onClick={() => {
                      setSelectedTimeSlot(slot.id)
                      setSelectedCourts([])
                    }}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
              {selectedTimeSlot && (
                <p className="mt-3 text-center text-sm text-primary/70">
                  Ngày: <span className="font-semibold text-primary">{selectedDateDisplay}</span><br />
                  Khung giờ áp dụng: <span className="font-semibold text-primary">{getSlotLabel(selectedTimeSlot, timeSlots)}</span><br />
                  Đơn giá theo giờ: <span className="font-semibold text-primary">{selectedSlotRateText}</span><br />
                  Giá khung giờ: <span className="font-semibold text-secondary">{selectedSlotPricePerCourt.toLocaleString("vi-VN")}đ</span> / sân
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary">
                Chọn sân {selectedTimeSlot && `(Khung giờ: ${getSlotLabel(selectedTimeSlot, timeSlots)})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTimeSlot ? (
                <p className="py-8 text-center text-primary/60">Vui lòng chọn khung giờ trước</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {COURTS.map((court) => {
                    const isBooked = isSlotBooked(court.id, selectedTimeSlot)
                    const isSelected = selectedCourts.includes(court.id)

                    return (
                      <button
                        key={court.id}
                        onClick={() => toggleCourt(court.id)}
                        disabled={isBooked}
                        className={`relative flex h-24 flex-col items-center justify-center rounded-xl border-2 transition-all ${
                          isBooked
                            ? "cursor-not-allowed border-gray-300 bg-gray-100 opacity-60"
                            : isSelected
                              ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg"
                              : "border-secondary bg-card text-primary hover:border-primary hover:shadow-md"
                        }`}
                      >
                        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`h-5 w-5 ${isSelected ? "text-primary-foreground" : "text-secondary"}`}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" />
                            <path d="M12 2a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold">{court.name}</span>
                        {isBooked && <Badge variant="secondary" className="absolute -right-2 -top-2 bg-gray-400 text-xs text-white">Đã đặt sân</Badge>}
                        {isSelected && <Badge className="absolute -right-2 -top-2 bg-secondary text-xs text-white">Đã chọn</Badge>}
                      </button>
                    )
                  })}
                </div>
              )}
              {selectedTimeSlot && (
                <p className="mt-3 text-sm text-primary/70">
                  Sân đã đặt: {bookedCourtsSet.size}/{COURTS.length} | Còn trống: {COURTS.length - bookedCourtsSet.size}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="sticky bottom-4">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                {selectedCourts.length > 0 ? (
                  <>
                    <p className="text-sm text-primary/70">
                      Đã chọn: <span className="font-semibold text-primary">{selectedCourts.length} sân</span>
                      {selectedTimeSlot && ` - Khung giờ: ${getSlotLabel(selectedTimeSlot, timeSlots)}`}
                    </p>
                    <p className="text-xl font-bold text-secondary">Tổng: {totalPrice.toLocaleString("vi-VN")}đ</p>
                  </>
                ) : (
                  <p className="text-primary/60">Chưa chọn sân nào</p>
                )}
              </div>
              <Button size="lg" onClick={handleBooking} disabled={selectedCourts.length === 0 || !selectedTimeSlot} className="w-full sm:w-auto">
                Đặt sân
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

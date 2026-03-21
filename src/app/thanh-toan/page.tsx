"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, MapPin, User, Phone, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { BookingApiError, createBooking } from "@/lib/bookings"

interface BookingData {
  date: string
  dateDisplay: string
  timeSlot: string
  timeSlotLabel?: string
  courts: number[]
  totalPrice: number
}

export default function PaymentPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string }>({})
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    const data = sessionStorage.getItem("bookingData")
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push("/dat-san")
    }
  }, [router])

  const validateForm = () => {
    const newErrors: { fullName?: string; phoneNumber?: string } = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự"
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (bookingData) {
      try {
        await createBooking({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          date: bookingData.date,
          dateDisplay: bookingData.dateDisplay,
          timeSlot: bookingData.timeSlot,
          timeSlotLabel: bookingData.timeSlotLabel ?? bookingData.timeSlot,
          courts: bookingData.courts,
          totalPrice: bookingData.totalPrice,
        })
      } catch (error) {
        setIsSubmitting(false)
        if (error instanceof BookingApiError) {
          if (error.status === 409) {
            setSubmitError(error.message)
            return
          }

          setSubmitError(error.message || "Hệ thống đang bận. Vui lòng thử lại.")
          return
        }

        setSubmitError("Sân vừa được đặt bởi người khác hoặc hệ thống lỗi. Vui lòng thử lại.")
        return
      }
    }

    setIsSubmitting(false)
    setIsSuccess(true)

    // Clear booking data
    sessionStorage.removeItem("bookingData")
  }

  if (!bookingData) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-primary/60">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-8">
          <Card className="mx-4 w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-primary">Đặt sân thành công!</h2>
              <p className="mb-6 text-primary/70">
                Cảm ơn bạn đã đặt sân tại Sân Cầu Lông Lộc Phát. Chúng tôi sẽ liên hệ xác nhận qua số điện thoại của bạn.
              </p>
              <div className="mb-6 rounded-lg bg-card p-4 text-left border border-border">
                <h3 className="mb-3 font-semibold text-primary">Thông tin đặt sân</h3>
                <div className="space-y-2 text-sm text-primary/80">
                  <p><span className="font-medium">Khách hàng:</span> {fullName}</p>
                  <p><span className="font-medium">Điện thoại:</span> {phoneNumber}</p>
                  <p><span className="font-medium">Ngày:</span> {bookingData.dateDisplay}</p>
                  <p><span className="font-medium">Giờ:</span> {bookingData.timeSlotLabel ?? bookingData.timeSlot}</p>
                  <p><span className="font-medium">Sân:</span> {bookingData.courts.map(c => `Sân ${c}`).join(", ")}</p>
                  <p className="text-lg font-bold text-secondary">
                    Tổng: {bookingData.totalPrice.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/dat-san">Đặt thêm sân</Link>
                </Button>
                <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href="/">Về trang chủ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <div className="mb-6">
            <Button
              variant="ghost"
              asChild
              className="text-primary hover:bg-primary/10"
            >
              <Link href="/dat-san">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại chọn sân
              </Link>
            </Button>
          </div>

          <h1 className="mb-8 text-center text-3xl font-bold text-primary">
            Xác Nhận Đặt Sân
          </h1>

          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Chi tiết đặt sân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <CalendarDays className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Ngày đặt</p>
                    <p className="font-medium text-primary">{bookingData.dateDisplay}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Khung giờ</p>
                    <p className="font-medium text-primary">
                      {bookingData.timeSlotLabel ?? bookingData.timeSlot}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <MapPin className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">Sân đã chọn</p>
                    <p className="font-medium text-primary">
                      {bookingData.courts.map((c) => `Sân ${c}`).join(", ")}
                    </p>
                    <p className="text-sm text-primary/60">
                      ({bookingData.courts.length} sân)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-primary/70">Số sân</span>
                    <span className="font-medium text-primary">{bookingData.courts.length}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-primary/70">Đơn giá</span>
                    <span className="font-medium text-primary">
                      {(bookingData.totalPrice / bookingData.courts.length).toLocaleString("vi-VN")}đ / sân / khung giờ
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">Tổng cộng</span>
                    <span className="text-2xl font-bold text-secondary">
                      {bookingData.totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-primary">
                      <User className="h-4 w-4" />
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nhập họ và tên"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                      }}
                      className={`bg-white ${errors.fullName ? "border-red-500" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-primary">
                      <Phone className="h-4 w-4" />
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined })
                      }}
                      className={`bg-white ${errors.phoneNumber ? "border-red-500" : ""}`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4">
                    <p className="text-sm text-primary/80">
                      <strong>Lưu ý:</strong> Vui lòng thanh toán tại quầy khi đến sân. 
                      Nhân viên sẽ liên hệ xác nhận qua số điện thoại của bạn.
                    </p>
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-500">{submitError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>Xác nhận đặt sân - {bookingData.totalPrice.toLocaleString("vi-VN")}đ</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

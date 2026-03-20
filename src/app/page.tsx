import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Users, Award, Phone, Wifi, Car } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full bg-card px-4 py-2 text-sm font-medium text-primary">
                <Award className="mr-2 h-4 w-4" />
                Chất lượng hàng đầu
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl text-balance">
                Sân Cầu Lông
                <span className="block text-secondary">Lộc Phát</span>
              </h1>
              <p className="mb-8 text-lg text-primary/80 md:text-xl text-pretty">
                Hệ thống 10 sân cầu lông chất lượng cao, trang bị đầy đủ tiện nghi. 
                Đặt sân trực tuyến nhanh chóng, tiện lợi - không cần đăng nhập!
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="text-lg">
                  <Link href="/dat-san">
                    Đặt sân ngay
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <a href="tel:0123456789">
                    <Phone className="mr-2 h-5 w-5" />
                    Liên hệ
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-primary">
              Tại sao chọn chúng tôi?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="10 Sân Chất Lượng"
                description="Hệ thống 10 sân cầu lông tiêu chuẩn, mặt sân cao su chống trơn trượt"
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8" />}
                title="Mở Cửa Cả Ngày"
                description="Hoạt động từ 5:00 đến 23:00, phục vụ mọi khung giờ của bạn"
              />
              <FeatureCard
                icon={<Wifi className="h-8 w-8" />}
                title="WiFi Miễn Phí"
                description="Kết nối internet tốc độ cao, tiện lợi cho mọi nhu cầu"
              />
              <FeatureCard
                icon={<Car className="h-8 w-8" />}
                title="Bãi Đỗ Xe Rộng"
                description="Bãi giữ xe rộng rãi, an toàn, miễn phí cho khách hàng"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-primary">
              Bảng giá thuê sân
            </h2>
            <div className="mx-auto max-w-2xl">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Khung giờ</th>
                        <th className="px-6 py-4 text-right font-semibold">Giá / 1 giờ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-6 py-4 text-primary">5:00 - 17:00</td>
                        <td className="px-6 py-4 text-right font-semibold text-secondary">39.000đ / giờ</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-primary">17:00 - 23:00</td>
                        <td className="px-6 py-4 text-right font-semibold text-secondary">59.000đ / giờ</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-secondary" />
              <h2 className="mb-4 text-3xl font-bold text-primary">Địa chỉ</h2>
              <p className="mb-6 text-lg text-primary/80">
                123 Đường ABC, Phường XYZ, Quận 123, TP. Hồ Chí Minh
              </p>
              <Button asChild size="lg">
                <Link href="/dat-san">
                  Đặt sân ngay
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="text-center transition-transform hover:scale-105">
      <CardContent className="pt-6">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-secondary/20 p-4 text-secondary">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
        <p className="text-sm text-primary/70">{description}</p>
      </CardContent>
    </Card>
  )
}

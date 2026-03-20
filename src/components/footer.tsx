import { Phone, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">Sân Cầu Lông Lộc Phát</h3>
            <p className="text-sm text-primary-foreground/80">
              Hệ thống sân cầu lông chất lượng cao, phục vụ mọi nhu cầu tập luyện và thi đấu của bạn.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Liên hệ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Đường ABC, Quận XYZ, TP. HCM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Giờ hoạt động</h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>5:00 - 23:00 (Tất cả các ngày)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-4 text-center text-sm text-primary-foreground/60">
          © 2026 Sân Cầu Lông Lộc Phát. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User } from "lucide-react"
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const ok = await isAdminAuthenticated()
      if (ok && active) {
        router.replace("/admin")
      }
    }

    void checkSession()
    return () => {
      active = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setError("")

    const result = await loginAdmin(username, password)
    if (!result.ok) {
      setError(result.message || "Sai tài khoản hoặc mật khẩu.")
      setIsSubmitting(false)
      return
    }

    router.push("/admin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center py-10">
        <div className="container mx-auto px-4">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">Đăng nhập quản trị</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Tài khoản</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                    <Input
                      id="admin-username"
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tài khoản"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                    <Input
                      id="admin-password"
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-primary/70">
                Chỉ dành cho quản trị viên để chỉnh giá và khung giờ.
              </p>

              <div className="mt-4 text-center text-sm">
                <Link href="/" className="text-primary underline-offset-4 hover:underline">Quay lại trang chủ</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

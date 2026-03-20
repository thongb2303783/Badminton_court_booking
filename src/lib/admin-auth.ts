type LoginResult = {
  ok: boolean
  message?: string
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const res = await fetch("/api/admin/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return false
  const data = (await res.json()) as { authenticated: boolean }
  return data.authenticated
}

export async function loginAdmin(username: string, password: string): Promise<LoginResult> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({ message: "Đăng nhập thất bại." }))) as {
      message?: string
    }
    return { ok: false, message: data.message }
  }

  return { ok: true }
}

export async function logoutAdmin(): Promise<void> {
  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include",
  })
}

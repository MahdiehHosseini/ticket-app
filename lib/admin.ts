import type { Session } from 'next-auth'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'

// ادمین = کسی که نام کاربری گیت‌هابش در ADMIN_LOGINS باشد
export function adminFromSession(s: Session | null) {
  const login = (s?.user as { login?: string } | undefined)?.login?.toLowerCase()
  const list = (process.env.ADMIN_LOGINS ?? '')
    .toLowerCase()
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  return !!login && list.includes(login)
}

export async function isAdmin() {
  return adminFromSession(await auth())
}

// در هر Server Action ادمین باید دوباره بررسی شود (فرم‌ها را می‌شود مستقیم صدا زد)
export async function requireAdmin() {
  if (!(await isAdmin())) notFound()
}

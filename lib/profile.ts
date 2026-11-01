import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { profiles } from '@/db/schema'

export type ProfileState = { ok?: boolean; error?: 'auth' | 'name' | 'phone' } | null

export async function getProfile(userId: string) {
  const [r] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  return r ?? null
}

// ارقام فارسی/عربی را لاتین می‌کند و 0912…، +98912…، 98912… و 912… را به 09123456789 تبدیل می‌کند
export function normalizePhone(v: string) {
  const d = v
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[\s\-()]/g, '')
  const m = d.match(/^(?:\+98|0098|98|0)?(9\d{9})$/)
  return m ? `0${m[1]}` : null
}

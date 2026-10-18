import { and, eq, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { payments, reservations } from '@/db/schema'
import { verifyPayment } from '@/lib/zarinpal'

// کاربر بعد از درگاه با ?Authority=...&Status=OK|NOK به اینجا برمی‌گردد
export async function GET(req: NextRequest) {
  const authority = req.nextUrl.searchParams.get('Authority') ?? ''
  const ok = req.nextUrl.searchParams.get('Status') === 'OK'
  const go = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl.origin))

  // فقط اولین callback هر تراکنش پردازش می‌شود (جلوگیری از پردازش دوباره با رفرش)
  const [p] = await db
    .update(payments)
    .set({ status: ok ? 'verifying' : 'failed' })
    .where(and(eq(payments.authority, authority), eq(payments.status, 'pending')))
    .returning()

  if (!p) {
    const [old] = await db.select().from(payments).where(eq(payments.authority, authority)).limit(1)
    if (!old) return go('/')
    return go(old.status === 'paid' ? '/tickets' : `/checkout?show=${old.showId}&error=cancelled`)
  }

  const back = (e: string) => go(`/checkout?show=${p.showId}&error=${e}`)
  if (!ok) return back('cancelled')

  // قبل از تایید مطمئن می‌شویم همه‌ی صندلی‌ها هنوز مال همین خریدارند.
  // اگر نباشند، تایید نمی‌کنیم و درگاه خودش مبلغ را برمی‌گرداند.
  const seats = p.seats.split(',')
  const held = await db
    .select({ seat: reservations.seat })
    .from(reservations)
    .where(
      and(
        eq(reservations.showId, p.showId),
        eq(reservations.holdToken, p.holdToken),
        eq(reservations.status, 'held'),
        sql`${reservations.expiresAt} > now()`,
      ),
    )
  if (held.length !== seats.length) {
    await db.update(payments).set({ status: 'failed' }).where(eq(payments.id, p.id))
    return back('lost')
  }

  let v: Awaited<ReturnType<typeof verifyPayment>> = null
  try {
    v = await verifyPayment(p.amount, authority)
  } catch {}
  if (!v) {
    // خطای موقت یا تایید ناموفق: به pending برمی‌گردد تا بشود دوباره تلاش کرد
    await db.update(payments).set({ status: 'pending' }).where(eq(payments.id, p.id))
    return back('verify')
  }

  const orderId = crypto.randomUUID()
  await db.transaction(async (tx) => {
    await tx
      .update(reservations)
      .set({ status: 'paid', expiresAt: null, holdToken: null, userId: p.userId, orderId })
      .where(
        and(
          eq(reservations.showId, p.showId),
          eq(reservations.holdToken, p.holdToken),
          eq(reservations.status, 'held'),
        ),
      )
    await tx.update(payments).set({ status: 'paid', refId: v.refId }).where(eq(payments.id, p.id))
  })
  return go('/tickets')
}

'use server'
import { randomUUID } from 'node:crypto'
import { TransactionRollbackError, and, eq, inArray, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { payments, reservations } from '@/db/schema'
import { cols, rows, seatPrice } from '@/lib/data'
import { getHold, getShow } from '@/lib/queries'
import { getUserId } from '@/lib/user'
import { requestPayment } from '@/lib/zarinpal'

const HOLD_MINUTES = 10
const MAX_SEATS = 6
const ALL = new Set(rows.flatMap((r) => Array.from({ length: cols }, (_, i) => `${r}${i + 1}`)))

type HoldError = { error: 'invalid' | 'taken'; seats?: string[] }

// صندلی‌ها را ۱۰ دقیقه نگه می‌دارد. اگر موفق شود به صفحه‌ی پرداخت می‌رود (redirect)،
// وگرنه خطا و لیست صندلی‌های گرفته‌شده را برمی‌گرداند.
export async function holdSeats(showId: string, seats: string[]): Promise<HoldError | undefined> {
  const unique = [...new Set(seats)]
  if (
    unique.length === 0 ||
    unique.length > MAX_SEATS ||
    !unique.every((s) => ALL.has(s)) ||
    !(await getShow(showId))
  ) {
    return { error: 'invalid' }
  }

  const jar = await cookies()
  const userId = await getUserId()
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/book/${showId}`)}`)
  const token = jar.get('hold')?.value ?? randomUUID()
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000)

  try {
    await db.transaction(async (tx) => {
      // ۱) آزادکردن نگه‌داری‌های منقضی‌شده‌ی این سانس و نگه‌داری قبلی همین مرورگر
      await tx
        .delete(reservations)
        .where(
          and(
            eq(reservations.showId, showId),
            eq(reservations.status, 'held'),
            sql`(${reservations.expiresAt} < now() or ${reservations.holdToken} = ${token})`,
          ),
        )
      // ۲) درج صندلی‌ها. محدودیت یکتای (سانس، صندلی) تضمین می‌کند دو نفر همزمان یک صندلی را نگیرند
      const ok = await tx
        .insert(reservations)
        .values(
          unique.map((seat) => ({
            showId,
            seat,
            status: 'held' as const,
            expiresAt,
            holdToken: token,
          })),
        )
        .onConflictDoNothing()
        .returning({ seat: reservations.seat })
      // ۳) حتی یک صندلی گرفته‌شده باشد، همه‌چیز برگردانده می‌شود (همه یا هیچ)
      if (ok.length !== unique.length) tx.rollback()
    })
  } catch (e) {
    if (!(e instanceof TransactionRollbackError)) throw e
    const busy = await db
      .select({ seat: reservations.seat })
      .from(reservations)
      .where(
        and(
          eq(reservations.showId, showId),
          inArray(reservations.seat, unique),
          sql`(${reservations.status} = 'paid' or ${reservations.expiresAt} > now())`,
          sql`${reservations.holdToken} is distinct from ${token}`,
        ),
      )
    return { error: 'taken', seats: busy.map((r) => r.seat) }
  }

  jar.set('hold', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: HOLD_MINUTES * 60 })
  redirect(`/checkout?show=${showId}`)
}

// پرداخت تستی: صندلی‌های نگه‌داشته‌شده را با «یک» UPDATE اتمیک به پرداخت‌شده تبدیل می‌کند.
// وقتی درگاه واقعی وصل شد، همین منطق در callback موفق درگاه اجرا می‌شود.
export async function payHold(showId: string) {
  const back = `/checkout?show=${showId}`
  const userId = await getUserId()
  const jar = await cookies()
  const token = jar.get('hold')?.value
  if (!userId || !token) redirect(back)

  const orderId = randomUUID()
  const paid = await db
    .update(reservations)
    .set({ status: 'paid', expiresAt: null, holdToken: null, userId, orderId })
    .where(
      and(
        eq(reservations.showId, showId),
        eq(reservations.holdToken, token),
        eq(reservations.status, 'held'),
        sql`${reservations.expiresAt} > now()`,
      ),
    )
    .returning({ seat: reservations.seat })

  if (paid.length === 0) redirect(back) // نگه‌داری منقضی شده
  redirect('/tickets')
}

// شروع پرداخت واقعی: مبلغ از صندلی‌های نگه‌داشته‌شده در دیتابیس محاسبه می‌شود (نه از کلاینت)
export async function startPayment(showId: string) {
  const back = (e = '') => `/checkout?show=${showId}${e ? `&error=${e}` : ''}`
  const userId = await getUserId()
  const token = (await cookies()).get('hold')?.value
  if (!userId || !token) redirect(back())

  const show = await getShow(showId)
  const hold = await getHold(showId, token)
  if (!show || hold.seats.length === 0) redirect(back())
  const amount = hold.seats.reduce((s, id) => s + seatPrice(show.price, id), 0)

  // تا وقتی کاربر در درگاه است، نگه‌داری صندلی‌ها منقضی نشود
  await db
    .update(reservations)
    .set({ expiresAt: new Date(Date.now() + 15 * 60_000) })
    .where(
      and(
        eq(reservations.showId, showId),
        eq(reservations.holdToken, token),
        eq(reservations.status, 'held'),
        sql`${reservations.expiresAt} > now()`,
      ),
    )

  const callback = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/payment/callback`
  let pay: Awaited<ReturnType<typeof requestPayment>> = null
  try {
    pay = await requestPayment(amount, callback, `Seats ${hold.seats.join(',')} - ${showId}`)
  } catch {}
  if (!pay) redirect(back('gateway'))

  await db.insert(payments).values({
    authority: pay.authority,
    showId,
    userId,
    holdToken: token,
    seats: hold.seats.join(','),
    amount,
  })
  redirect(pay.url)
}

import { TransactionRollbackError, and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { reservations } from '@/db/schema'

export type HoldResult = { ok: true } | { ok: false; busy: string[] }

// هسته‌ی رزرو موقت. «همه یا هیچ» و امن در برابر درخواست‌های همزمان.
export async function tryHold(
  showId: string,
  seats: string[],
  token: string,
  expiresAt: Date,
): Promise<HoldResult> {
  // ترتیب ثابت درج: وگرنه دو درخواست با ترتیب‌های متفاوت صندلی می‌توانند deadlock کنند
  const ordered = [...new Set(seats)].sort()
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
          ordered.map((seat) => ({
            showId,
            seat,
            status: 'held' as const,
            expiresAt,
            holdToken: token,
          })),
        )
        .onConflictDoNothing()
        .returning({ seat: reservations.seat })
      // ۳) حتی یک صندلی گرفته‌شده باشد، همه‌چیز برگردانده می‌شود
      if (ok.length !== ordered.length) tx.rollback()
    })
    return { ok: true }
  } catch (e) {
    if (!(e instanceof TransactionRollbackError)) throw e
    const busy = await db
      .select({ seat: reservations.seat })
      .from(reservations)
      .where(
        and(
          eq(reservations.showId, showId),
          inArray(reservations.seat, ordered),
          sql`(${reservations.status} = 'paid' or ${reservations.expiresAt} > now())`,
          sql`${reservations.holdToken} is distinct from ${token}`,
        ),
      )
    return { ok: false, busy: busy.map((r) => r.seat) }
  }
}

type Exec = Pick<typeof db, 'update'> // هم db و هم tx

// نگه‌داری‌های یک خریدار را «پرداخت‌شده» می‌کند و تعداد صندلی‌ها را برمی‌گرداند.
// allowExpired: بعد از تایید درگاه، تا وقتی ردیف‌ها هنوز مال همین خریدارند آن‌ها را قبول می‌کنیم.
export async function markPaid(
  exec: Exec,
  a: { showId: string; token: string; userId: string; orderId: string; allowExpired?: boolean },
) {
  const r = await exec
    .update(reservations)
    .set({ status: 'paid', expiresAt: null, holdToken: null, userId: a.userId, orderId: a.orderId })
    .where(
      and(
        eq(reservations.showId, a.showId),
        eq(reservations.holdToken, a.token),
        eq(reservations.status, 'held'),
        a.allowExpired ? undefined : sql`${reservations.expiresAt} > now()`,
      ),
    )
    .returning({ seat: reservations.seat })
  return r.length
}

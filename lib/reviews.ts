import { and, count, desc, eq, sql, sum } from 'drizzle-orm'
import { db } from '@/db'
import { events, profiles, reservations, reviews, shows } from '@/db/schema'

export type RatingStats = Record<string, { n: number; sum: number }>

// جمع و تعداد امتیازهای هر فیلم (یک کوئری برای همه‌ی فیلم‌ها)
export async function getRatingStats(): Promise<RatingStats> {
  const r = await db.select({ eventId: reviews.eventId, n: count(), sum: sum(reviews.stars) }).from(reviews).groupBy(reviews.eventId)
  return Object.fromEntries(r.map((x) => [x.eventId, { n: x.n, sum: Number(x.sum ?? 0) }]))
}

// امتیاز اولیه‌ی فیلم مثل «۵ رأی» حساب می‌شود؛ با اضافه‌شدن نظرها آرام‌آرام کنار می‌رود.
// ستاره‌های ۱ تا ۵ به مقیاس ۱۰ تبدیل می‌شوند (×۲)
const PRIOR_WEIGHT = 5
export function blended(base: string, s?: { n: number; sum: number }) {
  if (!s || s.n === 0) return base
  return ((parseFloat(base) * PRIOR_WEIGHT + 2 * s.sum) / (PRIOR_WEIGHT + s.n)).toFixed(1)
}

// فقط کسی که بلیت «واقعی» این فیلم را خریده و سانسش تمام شده می‌تواند نظر بدهد
export async function canReview(userId: string, eventId: string) {
  const [r] = await db
    .select({ n: count() })
    .from(reservations)
    .innerJoin(shows, eq(reservations.showId, shows.id))
    .innerJoin(events, eq(shows.eventId, events.id))
    .where(and(
      eq(shows.eventId, eventId),
      eq(reservations.userId, userId),
      eq(reservations.status, 'paid'),
      sql`${reservations.orderId} is not null`,
      sql`${shows.startsAt} + ${events.durationMin} * interval '1 minute' <= now()`,
    ))
  return r.n > 0
}

// توزیع امتیازها: اندیس ۰ = تعداد ۱ ستاره ... اندیس ۴ = تعداد ۵ ستاره
export async function getDistribution(eventId: string) {
  const r = await db.select({ stars: reviews.stars, n: count() }).from(reviews).where(eq(reviews.eventId, eventId)).groupBy(reviews.stars)
  const dist = [0, 0, 0, 0, 0]
  for (const x of r) if (x.stars >= 1 && x.stars <= 5) dist[x.stars - 1] = x.n
  return dist
}

const nameOf = (f?: string | null, l?: string | null) => [f, l ? `${l.charAt(0)}.` : ''].filter(Boolean).join(' ') || null

export async function getReviews(eventId: string, limit = 20) {
  const r = await db
    .select({ userId: reviews.userId, stars: reviews.stars, comment: reviews.comment, createdAt: reviews.createdAt, first: profiles.firstName, last: profiles.lastName })
    .from(reviews)
    .leftJoin(profiles, eq(profiles.userId, reviews.userId))
    .where(eq(reviews.eventId, eventId))
    .orderBy(desc(reviews.updatedAt))
    .limit(limit)
  // ایمیل و شناسه‌ی کاربر هرگز نمایش داده نمی‌شود، فقط نام و حرف اول نام خانوادگی
  return r.map((x) => ({ userId: x.userId, stars: x.stars, comment: x.comment, createdAt: x.createdAt, name: nameOf(x.first, x.last) }))
}

export async function getMyReview(eventId: string, userId: string) {
  const [r] = await db.select({ stars: reviews.stars, comment: reviews.comment }).from(reviews).where(and(eq(reviews.eventId, eventId), eq(reviews.userId, userId))).limit(1)
  return r ?? null
}

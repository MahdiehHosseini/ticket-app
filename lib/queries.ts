import { and, asc, count, desc, eq, gt, min, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { events, reservations, shows } from '@/db/schema'
import type { Event, Show } from './data'
import { cacheLife } from 'next/cache'

const TZ = 'Asia/Tehran'
const faDay = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TZ,
})
const enDay = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: TZ,
})
const clock = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TZ,
})

const toEvent = (r: typeof events.$inferSelect): Event => ({
  id: r.id,
  title: { fa: r.titleFa, en: r.titleEn },
  genre: { fa: r.genreFa, en: r.genreEn },
  blurb: { fa: r.blurbFa, en: r.blurbEn },
  duration: r.durationMin,
  rating: r.rating,
  colors: [r.colorFrom, r.colorTo],
})

const toShow = (r: typeof shows.$inferSelect): Show => ({
  id: r.id,
  eventId: r.eventId,
  day: { fa: faDay.format(r.startsAt), en: enDay.format(r.startsAt) },
  time: clock.format(r.startsAt),
  hall: { fa: r.hallFa, en: r.hallEn },
  price: r.price,
  startsAt: r.startsAt.toISOString(),
})

// صندلی «اشغال» = خریداری‌شده، یا نگه‌داشته‌شده‌ای که هنوز منقضی نشده
const active = or(eq(reservations.status, 'paid'), gt(reservations.expiresAt, sql`now()`))

export async function getEvents(): Promise<Event[]> {
  'use cache'
  cacheLife('minutes')
  return (await db.select().from(events).orderBy(asc(events.id))).map(toEvent)
}

export async function getEvent(id: string): Promise<Event | undefined> {
  const [r] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  return r && toEvent(r)
}

export async function getShows(eventId: string): Promise<Show[]> {
  return (
    await db.select().from(shows).where(eq(shows.eventId, eventId)).orderBy(asc(shows.startsAt))
  ).map(toShow)
}

export async function getShow(id: string): Promise<Show | undefined> {
  const [r] = await db.select().from(shows).where(eq(shows.id, id)).limit(1)
  return r && toShow(r)
}

// token: نگه‌داری‌های خود همین مرورگر «اشغال» حساب نمی‌شوند (تا بتواند دوباره ویرایششان کند)
export async function getTakenSeats(showId: string, token?: string): Promise<string[]> {
  const notMine = token ? sql`${reservations.holdToken} is distinct from ${token}` : undefined
  const r = await db
    .select({ seat: reservations.seat })
    .from(reservations)
    .where(and(eq(reservations.showId, showId), active, notMine))
  return r.map((x) => x.seat)
}

// صندلی‌هایی که این مرورگر الان (و هنوز منقضی‌نشده) نگه داشته
export async function getHold(showId: string, token?: string) {
  if (!token) return { seats: [] as string[], expiresAt: null as Date | null }
  const r = await db
    .select({ seat: reservations.seat, expiresAt: reservations.expiresAt })
    .from(reservations)
    .where(
      and(
        eq(reservations.showId, showId),
        eq(reservations.holdToken, token),
        eq(reservations.status, 'held'),
        gt(reservations.expiresAt, sql`now()`),
      ),
    )
  const seats = r.map((x) => x.seat).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  const expiresAt = r.length
    ? r.map((x) => x.expiresAt as Date).reduce((a, b) => (a < b ? a : b))
    : null
  return { seats, expiresAt }
}

// تعداد صندلی اشغال‌شده‌ی هر سانس یک رویداد، با یک کوئری
export async function getTakenCounts(eventId: string): Promise<Record<string, number>> {
  const r = await db
    .select({ showId: reservations.showId, n: count() })
    .from(reservations)
    .innerJoin(shows, eq(reservations.showId, shows.id))
    .where(and(eq(shows.eventId, eventId), active))
    .groupBy(reservations.showId)
  return Object.fromEntries(r.map((x) => [x.showId, x.n]))
}

// بلیت‌های پرداخت‌شده‌ی یک کاربر، گروه‌بندی‌شده بر اساس سفارش (تازه‌ترین اول)
export async function getMyTickets(userId: string) {
  const r = await db
    .select({ orderId: reservations.orderId, showId: reservations.showId, seat: reservations.seat })
    .from(reservations)
    .where(and(eq(reservations.userId, userId), eq(reservations.status, 'paid')))
    .orderBy(desc(reservations.createdAt))

  const orders = new Map<string, { showId: string; seats: string[] }>()
  for (const x of r) {
    if (!x.orderId) continue
    const o = orders.get(x.orderId) ?? { showId: x.showId, seats: [] }
    o.seats.push(x.seat)
    orders.set(x.orderId, o)
  }

  const list = await Promise.all(
    [...orders].map(async ([orderId, o]) => {
      const show = await getShow(o.showId)
      const event = show && (await getEvent(show.eventId))
      return show && event
        ? {
            orderId,
            show,
            event,
            seats: o.seats.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
          }
        : null
    }),
  )
  return list.filter((x): x is NonNullable<typeof x> => x !== null)
}

// فروش هر سانس: paid = همه‌ی صندلی‌های پرداخت‌شده، real = فقط فروش‌های واقعی (دارای سفارش، نه داده‌ی seed)
export async function getSalesByShow(): Promise<Record<string, { paid: number; real: number }>> {
  const r = await db
    .select({ showId: reservations.showId, paid: count(), real: count(reservations.orderId) })
    .from(reservations)
    .where(eq(reservations.status, 'paid'))
    .groupBy(reservations.showId)
  return Object.fromEntries(r.map((x) => [x.showId, { paid: x.paid, real: x.real }]))
}

// کمترین قیمت سانس هر رویداد (برای نشان «از ...» روی کارت)
export async function getFromPrices(): Promise<Record<string, number>> {
  const r = await db
    .select({ eventId: shows.eventId, p: min(shows.price) })
    .from(shows)
    .groupBy(shows.eventId)
  return Object.fromEntries(r.map((x) => [x.eventId, x.p ?? 0]))
}

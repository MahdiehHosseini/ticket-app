'use server'
import { count, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { events, reservations, shows } from '@/db/schema'
import { requireAdmin } from '@/lib/admin'

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim()
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const HEX = /^#[0-9a-f]{6}$/i
const toPersianDigit = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d])

export async function createEvent(form: FormData) {
  await requireAdmin()
  const titleEn = str(form, 'titleEn')
  const e = {
    id: slug(str(form, 'id') || titleEn),
    titleFa: str(form, 'titleFa'),
    titleEn,
    genreFa: str(form, 'genreFa'),
    genreEn: str(form, 'genreEn'),
    blurbFa: str(form, 'blurbFa'),
    blurbEn: str(form, 'blurbEn'),
    durationMin: Number(str(form, 'duration')),
    rating: str(form, 'rating'),
    colorFrom: str(form, 'colorFrom'),
    colorTo: str(form, 'colorTo'),
  }
  const rating = Number(e.rating)
  const valid =
    e.id &&
    e.titleFa &&
    e.titleEn &&
    e.genreFa &&
    e.genreEn &&
    e.blurbFa &&
    e.blurbEn &&
    Number.isInteger(e.durationMin) &&
    e.durationMin > 0 &&
    e.durationMin < 600 &&
    rating >= 0 &&
    rating <= 10 &&
    HEX.test(e.colorFrom) &&
    HEX.test(e.colorTo)
  if (!valid) return
  await db.insert(events).values(e).onConflictDoNothing()
  revalidatePath('/admin')
}

export async function createShow(form: FormData) {
  await requireAdmin()
  const eventId = str(form, 'eventId')
  const [y, m, d] = str(form, 'date').split('-').map(Number)
  const [hh, mm] = str(form, 'time').split(':').map(Number)
  const hall = Number(str(form, 'hall'))
  const price = Number(str(form, 'price'))
  if (![y, m, d, hh, mm, hall].every(Number.isInteger) || !(price >= 1000 && price <= 5_000_000))
    return
  const [ev] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (!ev) return

  // ساعت‌ها به وقت تهران (UTC+3:30) وارد می‌شوند
  const startsAt = new Date(Date.UTC(y, m - 1, d, hh, mm) - 3.5 * 3600 * 1000)
  await db.insert(shows).values({
    id: `${eventId}-${Date.now().toString(36)}`,
    eventId,
    startsAt,
    hallFa: `سالن ${toPersianDigit(hall)}`,
    hallEn: `Hall ${hall}`,
    price: Math.round(price),
  })
  revalidatePath('/admin')
}

// سانس یا رویدادی که فروش واقعی دارد پاک نمی‌شود (حذف، بلیت‌های خریداری‌شده را هم از بین می‌برد)
export async function deleteShow(id: string) {
  await requireAdmin()
  const [{ n }] = await db
    .select({ n: count(reservations.orderId) })
    .from(reservations)
    .where(eq(reservations.showId, id))
  if (n > 0) return
  await db.delete(shows).where(eq(shows.id, id))
  revalidatePath('/admin')
}

export async function deleteEvent(id: string) {
  await requireAdmin()
  const [{ n }] = await db
    .select({ n: count(reservations.orderId) })
    .from(reservations)
    .innerJoin(shows, eq(reservations.showId, shows.id))
    .where(eq(shows.eventId, id))
  if (n > 0) return
  await db.delete(events).where(eq(events.id, id))
  revalidatePath('/admin')
}

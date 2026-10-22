import 'dotenv/config'
import { cols, rows } from '../lib/data'
import { db, sql } from './index'
import { events, reservations, shows } from './schema'

const E = [
  {
    id: 'shab-e-abi',
    titleFa: 'شب آبی',
    titleEn: 'Blue Night',
    genreFa: 'درام',
    genreEn: 'Drama',
    durationMin: 112,
    rating: '7.9',
    colorFrom: '#1B2A6B',
    colorTo: '#6F8BE0',
    blurbFa:
      'نوازنده‌ای پیر در آخرین شب فعالیتش، گذشته‌ای را که سال‌ها پنهان کرده بود روی صحنه می‌آورد.',
    blurbEn: 'On his final night, an aging musician brings a long-hidden past onto the stage.',
  },
  {
    id: 'khane-ye-shisheyi',
    titleFa: 'خانه‌ی شیشه‌ای',
    titleEn: 'The Glass House',
    genreFa: 'هیجان‌انگیز',
    genreEn: 'Thriller',
    durationMin: 98,
    rating: '7.2',
    colorFrom: '#0F4C4A',
    colorTo: '#58B8A6',
    blurbFa: 'خانواده‌ای در خانه‌ای که همه‌چیزش دیده می‌شود، رازی دارد که نباید دیده شود.',
    blurbEn:
      'A family living in a house where everything is visible has one secret that must not be seen.',
  },
  {
    id: 'baghe-sorkh',
    titleFa: 'باغ سرخ',
    titleEn: 'The Red Garden',
    genreFa: 'کمدی',
    genreEn: 'Comedy',
    durationMin: 105,
    rating: '8.1',
    colorFrom: '#8E1B3A',
    colorTo: '#E27A6B',
    blurbFa: 'سه همسایه‌ی قدیمی سر یک درخت انار با هم قهر می‌کنند و کل محله درگیر می‌شود.',
    blurbEn:
      'Three old neighbors fall out over a pomegranate tree, and the whole street takes sides.',
  },
  {
    id: 'rah-e-shiri',
    titleFa: 'راه شیری',
    titleEn: 'Milky Way',
    genreFa: 'علمی‌تخیلی',
    genreEn: 'Sci-fi',
    durationMin: 131,
    rating: '8.4',
    colorFrom: '#2B1B5C',
    colorTo: '#A06BE0',
    blurbFa: 'خدمه‌ی یک ایستگاه فضایی سیگنالی می‌شنوند که ده سال پیش از زمین فرستاده شده است.',
    blurbEn: 'The crew of a space station picks up a signal sent from Earth ten years ago.',
  },
]

// تهران = UTC+3:30 (بدون ساعت تابستانی)
function at(dayOffset: number, h: number, m: number) {
  const n = new Date()
  return new Date(
    Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + dayOffset, h, m) -
      3.5 * 3600 * 1000,
  )
}

const slots = [
  [1, 18, 30, 1],
  [1, 21, 0, 2],
  [2, 17, 0, 1],
  [2, 20, 30, 2],
] as const

const S = E.flatMap((e, i) =>
  slots.map(([day, h, m, hall], k) => ({
    id: `${e.id}-${k + 1}`,
    eventId: e.id,
    startsAt: at(day, h, m),
    hallFa: `سالن ${hall === 1 ? '۱' : '۲'}`,
    hallEn: `Hall ${hall}`,
    price: 180000 + i * 10000 + k * 20000,
  })),
)

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// حدود ۲۶٪ صندلی‌ها رو «خریداری‌شده» می‌ذاریم تا نقشه واقعی‌تر باشه
const R = S.flatMap((s) =>
  rows.flatMap((r) =>
    Array.from({ length: cols }, (_, c) => `${r}${c + 1}`)
      .filter((seat) => hash(s.id + seat) % 100 < 26)
      .map((seat) => ({ showId: s.id, seat, status: 'paid' as const })),
  ),
)

async function main() {
  await db.delete(reservations)
  await db.delete(shows)
  await db.delete(events)
  await db.insert(events).values(E)
  await db.insert(shows).values(S)
  await db.insert(reservations).values(R)
  process.stdout.write(`seeded: ${E.length} events, ${S.length} shows, ${R.length} reservations\n`)
  await sql.end()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

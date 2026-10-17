import type { L } from './i18n'

// نوع‌ها و ثابت‌های مشترک. داده‌ها حالا از دیتابیس می‌آیند (lib/queries.ts).
export type Event = {
  id: string
  title: L
  genre: L
  duration: number
  rating: string
  blurb: L
  colors: [string, string]
}
export type Show = {
  id: string
  eventId: string
  day: L
  time: string
  hall: L
  price: number
  startsAt: string
}

export const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
export const cols = 12

// ردیف‌های وسط (D تا F) گران‌ترند
export const seatPrice = (base: number, seat: string) =>
  /^[D-F]/.test(seat) ? Math.round(base * 1.25) : base

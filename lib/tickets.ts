import type { Event, Show } from './data'

export type TicketState = 'upcoming' | 'live' | 'expired'

// فروش هر سانس تا لحظه‌ی شروع باز است
export const salesOpen = (s: Show, now = Date.now()) => new Date(s.startsAt).getTime() > now

// بلیت از شروع سانس تا پایان فیلم (شروع + مدت فیلم) معتبر است، بعدش منقضی می‌شود
export function ticketState(s: Show, e: Event, now = Date.now()): TicketState {
  const start = new Date(s.startsAt).getTime()
  const end = start + e.duration * 60_000
  return now < start ? 'upcoming' : now < end ? 'live' : 'expired'
}

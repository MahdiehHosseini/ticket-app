import { cacheLife } from 'next/cache'
import { getEvent, getEvents } from './queries'

// لیست فیلم‌ها کم‌تغییر است. برای متادیتا و sitemap کش می‌شود (صندلی‌ها و سانس‌ها زنده می‌مانند).
export async function getEventsCached() {
  'use cache'
  cacheLife('minutes')
  return getEvents()
}

export async function getEventCached(id: string) {
  'use cache'
  cacheLife('minutes')
  return getEvent(id)
}

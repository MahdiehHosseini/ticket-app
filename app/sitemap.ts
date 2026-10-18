import type { MetadataRoute } from 'next'
import { getEventsCached } from '@/lib/cached'

const base = process.env.APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEventsCached()
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    ...events.map((e) => ({
      url: `${base}/events/${e.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}

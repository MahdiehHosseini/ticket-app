import Link from 'next/link'
import type { Event } from '@/lib/data'
import { dict, digits, fmt, pick, type Locale } from '@/lib/i18n'
import Poster from './Poster'
import Tilt from './Tilt'

export default function EventCard({
  event,
  locale,
  price,
}: {
  event: Event
  locale: Locale
  price?: number
}) {
  const t = dict[locale]
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Tilt>
        <div className="relative">
          <Poster event={event} locale={locale} className="aspect-[3/4]" />
          <span className="glass-pill absolute end-3 top-3">★ {digits(event.rating, locale)}</span>
          {price ? (
            <span className="glass-pill absolute start-3 bottom-3">
              {t.fromPrice} {fmt(locale)(price)}
            </span>
          ) : null}
        </div>
      </Tilt>
      <h3 className="mt-4 text-lg font-extrabold">{pick(event.title, locale)}</h3>
      <p className="text-sm text-[var(--muted)]">
        {pick(event.genre, locale)} • {fmt(locale)(event.duration)} {t.min}
      </p>
    </Link>
  )
}

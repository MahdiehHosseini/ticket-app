import Link from 'next/link'
import type { Event } from '@/lib/data'
import { pick, type Locale } from '@/lib/i18n'
import { Stars } from './Icons'
import Poster from './Poster'

export default function EventCard({
  event,
  locale,
  small = false,
}: {
  event: Event
  locale: Locale
  small?: boolean
}) {
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Poster
        event={event}
        locale={locale}
        variant={small ? 'small' : 'card'}
        className={`${small ? 'aspect-[2/3]' : 'aspect-[3/4]'} transition-transform group-hover:-translate-y-1`}
      />
      <h3 className={`mt-3 font-bold ${small ? 'text-sm' : 'text-lg'}`}>
        {pick(event.title, locale)}
      </h3>
      <div className="mt-1">
        <Stars rating={event.rating} />
      </div>
    </Link>
  )
}

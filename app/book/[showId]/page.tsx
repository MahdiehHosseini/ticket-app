import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, type ComponentProps } from 'react'
import { Chevron, iconBtn } from '@/components/Icons'
import SeatMap from '@/components/SeatMap'
import Skeleton from '@/components/Skeleton'
import { dayChip, dayKey } from '@/lib/format'
import { dict, digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvent, getShow, getShows, getTakenSeats } from '@/lib/queries'

async function Content({ params }: { params: Promise<{ showId: string }> }) {
  const { showId } = await params
  const { locale } = await getPrefs()
  const show = await getShow(showId)
  const event = show && (await getEvent(show.eventId))
  if (!show || !event) notFound()

  const [list, taken] = await Promise.all([getShows(event.id), getTakenSeats(show.id)])
  const t = dict[locale]
  const key = dayKey(show.startsAt)
  const firstOfDay = list.filter(
    (s, i) => list.findIndex((x) => dayKey(x.startsAt) === dayKey(s.startsAt)) === i,
  )
  const sameDay = list.filter((s) => dayKey(s.startsAt) === key)
  const row =
    'no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 py-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0'

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 pt-6 lg:px-8">
        <Link href={`/events/${event.id}`} aria-label={t.back} className={iconBtn}>
          <Chevron className="rtl:rotate-180" />
        </Link>
        <p className="mt-4 text-xs font-semibold text-[var(--accent)]">
          {pick(event.genre, locale)}
        </p>
        <h1 className="text-2xl font-extrabold lg:text-3xl">{pick(event.title, locale)}</h1>
        <p className="text-sm text-[var(--muted)]">
          {pick(show.hall, locale)} • {fmt(locale)(event.duration)} {t.min}
        </p>
      </div>

      <SeatMap showId={show.id} base={show.price} taken={taken} locale={locale}>
        <div className={row}>
          {firstOfDay.map((s) => {
            const c = dayChip(s.startsAt, locale)
            const on = dayKey(s.startsAt) === key
            return (
              <Link
                key={s.id}
                href={`/book/${s.id}`}
                replace
                scroll={false}
                aria-current={on ? 'date' : undefined}
                className={`w-14 shrink-0 rounded-2xl py-3 text-center transition-colors ${on ? 'bg-[var(--accent)] text-white' : 'bg-[var(--avail)] hover:bg-[var(--line)]'}`}
              >
                <b className="block text-lg leading-tight">{c.num}</b>
                <span className="text-[11px] opacity-80">{c.wd}</span>
              </Link>
            )
          })}
        </div>
        <div className={row.replace('gap-3', 'gap-2')}>
          {sameDay.map((s) => (
            <Link
              key={s.id}
              href={`/book/${s.id}`}
              replace
              scroll={false}
              aria-current={s.id === show.id ? 'time' : undefined}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${s.id === show.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--avail)] hover:bg-[var(--line)]'}`}
            >
              {digits(s.time, locale)}
            </Link>
          ))}
        </div>
      </SeatMap>
    </div>
  )
}

export default function BookPage(props: ComponentProps<typeof Content>) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content {...props} />
    </Suspense>
  )
}

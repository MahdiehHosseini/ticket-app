import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, type ComponentProps } from 'react'
import { Chevron, cta, iconBase, Stars } from '@/components/Icons'
import Poster from '@/components/Poster'
import Skeleton from '@/components/Skeleton'
import { dayKey } from '@/lib/format'
import { dict, digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvent, getShows } from '@/lib/queries'

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { locale } = await getPrefs()
  const event = await getEvent(id)
  if (!event) notFound()

  const list = await getShows(id)
  const t = dict[locale]
  const days = [...new Set(list.map((s) => dayKey(s.startsAt)))]
  const buy = list[0] && (
    <Link href={`/book/${list[0].id}`} className={cta}>
      <span>{t.buyTickets}</span>
      <Chevron className="ltr:rotate-180" />
    </Link>
  )

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[400px_1fr] lg:items-start lg:gap-10 lg:px-8 lg:pb-12 lg:pt-6">
      <div className="relative lg:sticky lg:top-6">
        <Poster
          event={event}
          locale={locale}
          variant="hero"
          className="h-80 lg:h-[540px] lg:rounded-3xl"
        />
        <Link
          href="/"
          aria-label={t.back}
          className={`${iconBase} absolute start-4 top-5 bg-white/90 text-[#16164a]`}
        >
          <Chevron className="rtl:rotate-180" />
        </Link>
      </div>

      <section className="relative -mt-8 flex-1 rounded-t-[2rem] bg-[var(--card)] px-5 pb-6 pt-6 lg:mt-0 lg:rounded-3xl lg:p-10">
        <p className="text-xs font-semibold text-[var(--accent)]">{pick(event.genre, locale)}</p>
        <h1 className="mt-1 text-2xl font-extrabold lg:text-4xl">{pick(event.title, locale)}</h1>
        <div className="mt-2 flex items-center justify-between lg:justify-start lg:gap-6">
          <Stars rating={event.rating} />
          <span className="text-sm font-bold text-[var(--accent)]">
            {fmt(locale)(event.duration)} {t.min}
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] lg:text-base lg:leading-8">
          {pick(event.blurb, locale)}
        </p>

        <h2 className="mb-3 mt-7 text-lg font-extrabold">{t.showtimes}</h2>
        {list.length === 0 && <p className="text-sm text-[var(--muted)]">{t.noShows}</p>}
        {days.map((d) => {
          const group = list.filter((s) => dayKey(s.startsAt) === d)
          return (
            <div key={d} className="mb-4">
              <h3 className="mb-2 text-sm text-[var(--muted)]">{pick(group[0].day, locale)}</h3>
              <div className="flex flex-wrap gap-2">
                {group.map((s) => (
                  <Link
                    key={s.id}
                    href={`/book/${s.id}`}
                    className="rounded-xl bg-[var(--avail)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--accent)] hover:text-white"
                  >
                    {digits(s.time, locale)}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
        <div className="mt-8 hidden lg:block lg:max-w-xs">{buy}</div>
      </section>

      {buy && <div className="sticky bottom-0 bg-[var(--card)] p-4 lg:hidden">{buy}</div>}
    </div>
  )
}

export default function EventPage(props: ComponentProps<typeof Content>) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content {...props} />
    </Suspense>
  )
}

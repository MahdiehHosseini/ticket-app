import Link from 'next/link'
import { Suspense } from 'react'
import AppBar from '@/components/AppBar'
import EventCard from '@/components/EventCard'
import { Chevron, Stars } from '@/components/Icons'
import Poster from '@/components/Poster'
import Skeleton from '@/components/Skeleton'
import { dict, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvents } from '@/lib/queries'

async function Content() {
  const { locale } = await getPrefs()
  const t = dict[locale]
  const events = await getEvents()
  const top = [...events].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
  const hero = top[0]

  return (
    <div className="flex-1 pb-10">
      <div className="lg:hidden">
        <AppBar />
      </div>

      {/* بنر شاخص: فقط دسکتاپ */}
      {hero && (
        <section className="relative mx-8 mt-6 hidden overflow-hidden rounded-3xl lg:block">
          <Poster event={hero} locale={locale} variant="hero" className="h-[400px] rounded-3xl" />
          <div className="absolute inset-0 flex max-w-xl flex-col justify-center gap-3 p-12 text-white">
            <p className="text-sm font-semibold opacity-90">
              {pick(hero.genre, locale)} • {fmt(locale)(hero.duration)} {t.min}
            </p>
            <h2 className="text-5xl font-extrabold leading-tight">{pick(hero.title, locale)}</h2>
            <Stars rating={hero.rating} />
            <p className="line-clamp-3 text-sm leading-7 opacity-90">{pick(hero.blurb, locale)}</p>
            <Link
              href={`/events/${hero.id}`}
              className="mt-3 flex w-fit items-center gap-3 rounded-full bg-white px-7 py-3.5 font-bold text-[#16164a]"
            >
              {t.buyTickets}
              <Chevron className="ltr:rotate-180" />
            </Link>
          </div>
        </section>
      )}

      <h1 className="mt-8 px-5 text-2xl font-extrabold lg:px-8">{t.movies}</h1>
      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 lg:gap-6 lg:px-8">
        {events.map((e) => (
          <div key={e.id} className="w-[64%] shrink-0 snap-start md:w-auto">
            <EventCard event={e} locale={locale} />
          </div>
        ))}
      </div>

      <h2 className="mt-8 px-5 text-xl font-extrabold lg:hidden">{t.trending}</h2>
      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-5 pb-2 md:hidden">
        {top.map((e) => (
          <div key={e.id} className="w-28 shrink-0">
            <EventCard event={e} locale={locale} small />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  )
}

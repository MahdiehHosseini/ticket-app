import Link from 'next/link'
import { Suspense } from 'react'
import AppBar from '@/components/AppBar'
import EventBrowser from '@/components/EventBrowser'
import { Chevron, Stars, cta } from '@/components/Icons'
import Poster from '@/components/Poster'
import Skeleton from '@/components/Skeleton'
import { dict, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvents, getFromPrices } from '@/lib/queries'

async function Content() {
  const { locale } = await getPrefs()
  const t = dict[locale]
  const [events, prices] = await Promise.all([getEvents(), getFromPrices()])
  const hero = [...events].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0]

  return (
    <div className="flex-1 pb-12">
      <div className="lg:hidden">
        <AppBar />
      </div>

      {/* بنر شاخص: فقط دسکتاپ */}
      {hero && (
        <section className="rise relative mx-8 mt-6 hidden overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] lg:block">
          <Poster
            event={hero}
            locale={locale}
            variant="hero"
            className="h-[420px] rounded-[2rem]"
          />
          <div className="absolute inset-0 flex max-w-xl flex-col justify-center gap-3 p-14 text-white">
            <p className="text-sm font-semibold opacity-90">
              {pick(hero.genre, locale)} • {fmt(locale)(hero.duration)} {t.min}
            </p>
            <h2 className="text-6xl leading-tight font-extrabold drop-shadow-lg">
              {pick(hero.title, locale)}
            </h2>
            <Stars rating={hero.rating} />
            <p className="line-clamp-3 text-sm leading-7 opacity-90">{pick(hero.blurb, locale)}</p>
            <Link href={`/events/${hero.id}`} className={`${cta} mt-4 w-fit gap-4`}>
              <span>{t.buyTickets}</span>
              <Chevron className="ltr:rotate-180" />
            </Link>
          </div>
        </section>
      )}

      <div className="rise mt-8 px-5 lg:px-8" style={{ '--i': 2 } as React.CSSProperties}>
        <h1 className="text-3xl font-extrabold">{t.movies}</h1>
        <p className="mt-1 max-w-md text-sm text-[var(--muted)]">{t.heroSub}</p>
      </div>
      <div className="mt-5">
        <EventBrowser events={events} prices={prices} locale={locale} />
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

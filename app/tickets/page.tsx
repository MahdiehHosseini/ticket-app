import { Suspense } from 'react'
import AppBar from '@/components/AppBar'
import Skeleton from '@/components/Skeleton'
import { seatPrice } from '@/lib/data'
import { dict, digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvents, getShows } from '@/lib/queries'

// الگوی نمایشی شبیه QR؛ در مرحله‌ی پرداخت با QR واقعی جایگزین می‌شود
const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + (i % 5) * 3) % 3 !== 0)
const SEATS = ['D5', 'D6']

async function Content() {
  const { locale } = await getPrefs()
  const t = dict[locale]
  const f = fmt(locale)

  // نمونه‌ی موقت تا مرحله‌ی احراز هویت: اولین رویداد و دومین سانسش
  const event = (await getEvents())[0]
  const show = event && (await getShows(event.id))[1]
  const total = show ? SEATS.reduce((s, id) => s + seatPrice(show.price, id), 0) : 0

  return (
    <div className="flex-1 pb-10">
      <div className="lg:hidden">
        <AppBar />
      </div>
      <h1 className="mt-8 px-5 text-2xl font-extrabold lg:px-8 lg:text-3xl">{t.myTickets}</h1>
      <div className="mt-4 grid gap-5 px-5 md:grid-cols-2 lg:px-8">
        {event && show && (
          <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)]">
            <div
              className="p-5 text-white"
              style={{
                background: `linear-gradient(155deg, ${event.colors[0]}, ${event.colors[1]})`,
              }}
            >
              <h2 className="text-xl font-extrabold">{pick(event.title, locale)}</h2>
              <p className="text-sm opacity-90">
                {pick(show.day, locale)} • {digits(show.time, locale)} • {pick(show.hall, locale)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-dashed border-[var(--line)] p-5">
              <div className="text-sm">
                <p>
                  {t.seatsLabel}: <b>{SEATS.join(locale === 'fa' ? '، ' : ', ')}</b>
                </p>
                <p>
                  {t.amount}:{' '}
                  <b>
                    {f(total)} {t.currency}
                  </b>
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {t.code}: {f(48213907)}
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-7 gap-0.5" aria-label={t.entry}>
                {cells.map((on, i) => (
                  <i
                    key={i}
                    className={`h-2.5 w-2.5 ${on ? 'bg-[var(--ink)]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default function Tickets() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  )
}

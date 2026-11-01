import Link from 'next/link'
import { Suspense } from 'react'
import AppBar from '@/components/AppBar'
import { cta } from '@/components/Icons'
import LoginGate from '@/components/LoginGate'
import Skeleton from '@/components/Skeleton'
import { seatPrice } from '@/lib/data'
import { dict, digits, fmt, pick, type Locale } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { qrSvg } from '@/lib/qr'
import { getMyTickets } from '@/lib/queries'
import { ticketState, type TicketState } from '@/lib/tickets'
import { getUserId } from '@/lib/user'

export const metadata = { robots: { index: false, follow: false } }

type Ticket = Awaited<ReturnType<typeof getMyTickets>>[number] & { state: TicketState }

function TicketCard({ k, locale, qr }: { k: Ticket; locale: Locale; qr?: string }) {
  const t = dict[locale]
  const f = fmt(locale)
  const expired = k.state === 'expired'
  const total = k.seats.reduce((s, id) => s + seatPrice(k.show.price, id), 0)

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] ${expired ? 'opacity-60 grayscale' : ''}`}
    >
      <div
        className="relative p-5 text-white"
        style={{ background: `linear-gradient(155deg, ${k.event.colors[0]}, ${k.event.colors[1]})` }}
      >
        {k.state !== 'upcoming' && (
          <span className="glass-pill absolute end-4 top-4">{expired ? t.expired : t.inProgress}</span>
        )}
        <h2 className="text-xl font-extrabold">{pick(k.event.title, locale)}</h2>
        <p className="text-sm opacity-90">
          {pick(k.show.day, locale)} • {digits(k.show.time, locale)} • {pick(k.show.hall, locale)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-[var(--line)] p-5">
        <div className="text-sm">
          <p>
            {t.seatsLabel}: <b>{k.seats.join(locale === 'fa' ? '، ' : ', ')}</b>
          </p>
          <p>
            {t.amount}: <b>{f(total)} {t.currency}</b>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t.code}: <span dir="ltr">{k.orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
        {expired || !qr ? (
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-[var(--avail)] text-center text-xs font-bold text-[var(--muted)]">
            {t.expired}
          </div>
        ) : (
          <div
            className="h-24 w-24 shrink-0 rounded-xl bg-white p-2"
            role="img"
            aria-label={t.entry}
            dangerouslySetInnerHTML={{ __html: qr }}
          />
        )}
      </div>
    </article>
  )
}

async function Content() {
  const { locale } = await getPrefs()
  const t = dict[locale]
  const userId = await getUserId()
  const head = (
    <div className="lg:hidden">
      <AppBar />
    </div>
  )

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col">
        {head}
        <LoginGate locale={locale} redirectTo="/tickets" message={t.loginToSee} />
      </div>
    )
  }

  const now = Date.now()
  const all: Ticket[] = (await getMyTickets(userId)).map((k) => ({ ...k, state: ticketState(k.show, k.event, now) }))
  // فعال‌ها: نزدیک‌ترین سانس اول. منقضی‌ها: تازه‌ترین اول
  const active = all.filter((k) => k.state !== 'expired').sort((a, b) => a.show.startsAt.localeCompare(b.show.startsAt))
  const expired = all.filter((k) => k.state === 'expired').sort((a, b) => b.show.startsAt.localeCompare(a.show.startsAt))
  const qrs = await Promise.all(active.map((k) => qrSvg(k.orderId)))
  const grid = 'mt-3 grid gap-5 px-5 md:grid-cols-2 lg:px-8'

  return (
    <div className="flex-1 pb-10">
      {head}
      <h1 className="mt-8 px-5 text-2xl font-extrabold lg:px-8 lg:text-3xl">{t.myTickets}</h1>

      {all.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 px-5 text-center">
          <p className="text-[var(--muted)]">{t.noTickets}</p>
          <Link href="/" className={`${cta} max-w-xs`}>
            <span>{t.movies}</span>
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <>
          <h2 className="mt-6 px-5 text-lg font-bold lg:px-8">{t.ticketsActive}</h2>
          <div className={grid}>
            {active.map((k, i) => (
              <TicketCard key={k.orderId} k={k} locale={locale} qr={qrs[i]} />
            ))}
          </div>
        </>
      )}

      {expired.length > 0 && (
        <>
          <h2 className="mt-8 px-5 text-lg font-bold text-[var(--muted)] lg:px-8">{t.ticketsExpired}</h2>
          <div className={grid}>
            {expired.map((k) => (
              <TicketCard key={k.orderId} k={k} locale={locale} />
            ))}
          </div>
        </>
      )}
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

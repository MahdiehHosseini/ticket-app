import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, type ComponentProps } from 'react'
import Countdown from '@/components/Countdown'
import LoginGate from '@/components/LoginGate'
import { payHold, startPayment } from '@/app/actions'
import { getUserId } from '@/lib/user'
import { gatewayEnabled } from '@/lib/zarinpal'
import { Chevron, cta, iconBtn } from '@/components/Icons'
import Skeleton from '@/components/Skeleton'
import { seatPrice } from '@/lib/data'
import { getHoldToken } from '@/lib/hold'
import { dict, digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvent, getHold, getShow } from '@/lib/queries'

export const metadata = { robots: { index: false, follow: false } }

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; error?: string }>
}) {
  const { show: showId = '', error = '' } = await searchParams
  const { locale } = await getPrefs()
  const show = await getShow(showId)
  const event = show && (await getEvent(show.eventId))
  if (!show || !event) notFound()

  // صندلی‌ها و قیمت از دیتابیس می‌آیند، نه از URL (قابل دستکاری نیست)
  const hold = await getHold(show.id, await getHoldToken())
  const t = dict[locale]
  const f = fmt(locale)
  const msg = (
    {
      cancelled: t.payCancelled,
      gateway: t.gatewayDown,
      lost: t.payLost,
      verify: t.payVerify,
    } as Record<string, string>
  )[error]

  if (hold.seats.length === 0 || !hold.expiresAt) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
        <p className="text-lg font-bold">{t.holdExpired}</p>
        {msg && (
          <p role="alert" className="max-w-sm text-sm text-[var(--accent)]">
            {msg}
          </p>
        )}
        <Link href={`/book/${show.id}`} className={`${cta} mx-auto max-w-xs`}>
          <span>{t.backToSeats}</span>
          <Chevron className="ltr:rotate-180" />
        </Link>
      </div>
    )
  }

  if (!(await getUserId()))
    return (
      <LoginGate locale={locale} redirectTo={`/checkout?show=${show.id}`} message={t.loginToPay} />
    )

  const list = hold.seats
  const total = list.reduce((s, id) => s + seatPrice(show.price, id), 0)
  const input =
    'w-full rounded-xl bg-[var(--avail)] px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'
  const pay = (
    <form action={(gatewayEnabled() ? startPayment : payHold).bind(null, show.id)}>
      <button className={cta}>
        <span>{t.pay}</span>
        <span className="flex items-center gap-2">
          {f(total)} {t.currency}
          <Chevron className="ltr:rotate-180" />
        </span>
      </button>
    </form>
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 px-5 pt-6 lg:px-8 lg:pb-12">
        <Link href={`/book/${show.id}`} aria-label={t.back} className={iconBtn}>
          <Chevron className="rtl:rotate-180" />
        </Link>
        <h1 className="mt-4 mb-4 text-2xl font-extrabold lg:text-3xl">{t.buyer}</h1>
        <div className="mb-5 max-w-md">
          <Countdown expiresAt={hold.expiresAt.toISOString()} locale={locale} />
        </div>
        {msg && (
          <p role="alert" className="mb-5 max-w-md text-sm text-[var(--accent)]">
            {msg}
          </p>
        )}

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
          <aside className="order-first rounded-2xl bg-[var(--avail)] p-4 lg:sticky lg:top-6 lg:order-none lg:col-start-2 lg:row-start-1 lg:rounded-3xl lg:bg-[var(--card)] lg:p-6">
            <h2 className="font-bold">{pick(event.title, locale)}</h2>
            <p className="mb-3 text-sm text-[var(--muted)]">
              {pick(show.day, locale)} • {digits(show.time, locale)} • {pick(show.hall, locale)}
            </p>
            <ul className="divide-y divide-[var(--line)] text-sm">
              {list.map((s) => (
                <li key={s} className="flex justify-between py-2">
                  <span>
                    {t.seat} {s}
                  </span>
                  <span>{f(seatPrice(show.price, s))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-3 font-bold">
              <span>{t.payable}</span>
              <span>
                {f(total)} {t.currency}
              </span>
            </div>
            <div className="mt-4 hidden lg:block">{pay}</div>
          </aside>

          <div className="lg:col-start-1 lg:row-start-1 lg:rounded-3xl lg:bg-[var(--card)] lg:p-8">
            <div className="grid max-w-md gap-4">
              <label className="grid gap-1 text-sm">
                {t.fullName}
                <input className={input} />
              </label>
              <label className="grid gap-1 text-sm">
                {t.mobile}
                <input dir="ltr" inputMode="tel" className={input} placeholder="09123456789" />
              </label>
              <label className="grid gap-1 text-sm">
                {t.promo}
                <input dir="ltr" className={input} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-[var(--card)] p-4 lg:hidden">{pay}</div>
    </div>
  )
}

export default function Checkout(props: ComponentProps<typeof Content>) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content {...props} />
    </Suspense>
  )
}

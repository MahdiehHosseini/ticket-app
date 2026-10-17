import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, type ComponentProps } from 'react'
import { Chevron, cta, iconBtn } from '@/components/Icons'
import Skeleton from '@/components/Skeleton'
import { seatPrice } from '@/lib/data'
import { dict, digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvent, getShow } from '@/lib/queries'

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; seats?: string }>
}) {
  const { show: showId = '', seats = '' } = await searchParams
  const { locale } = await getPrefs()
  const show = await getShow(showId)
  const event = show && (await getEvent(show.eventId))
  const list = seats.split(',').filter(Boolean)
  if (!show || !event || list.length === 0) notFound()

  const t = dict[locale]
  const f = fmt(locale)
  const total = list.reduce((s, id) => s + seatPrice(show.price, id), 0)
  const input =
    'w-full rounded-xl bg-[var(--avail)] px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'
  const pay = (
    <Link href="/tickets" className={cta}>
      <span>{t.pay}</span>
      <span className="flex items-center gap-2">
        {f(total)} {t.currency}
        <Chevron className="ltr:rotate-180" />
      </span>
    </Link>
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 px-5 pt-6 lg:px-8 lg:pb-12">
        <Link href={`/book/${show.id}`} aria-label={t.back} className={iconBtn}>
          <Chevron className="rtl:rotate-180" />
        </Link>
        <h1 className="mb-4 mt-4 text-2xl font-extrabold lg:text-3xl">{t.buyer}</h1>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
          <aside className="order-first rounded-2xl bg-[var(--avail)] p-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:sticky lg:top-6 lg:rounded-3xl lg:bg-[var(--card)] lg:p-6">
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
            <p className="mb-5 text-xs text-[var(--muted)]">{t.holdNow}</p>
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

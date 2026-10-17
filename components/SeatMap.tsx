'use client'
import Link from 'next/link'
import { useState } from 'react'
import { cols, rows, seatPrice } from '@/lib/data'
import { dict, fmt, type Locale } from '@/lib/i18n'
import { Chevron, cta, ctaOff } from './Icons'

const MAX = 6
const HALF = cols / 2
const GRID =
  'grid grid-cols-[14px_repeat(6,minmax(0,1fr))_14px_repeat(6,minmax(0,1fr))] items-center gap-x-1.5 lg:gap-x-2'

export default function SeatMap({
  showId,
  base,
  taken,
  locale,
  children,
}: {
  showId: string
  base: number
  taken: string[]
  locale: Locale
  children?: React.ReactNode
}) {
  const t = dict[locale]
  const f = fmt(locale)
  const [picked, setPicked] = useState<string[]>([])
  const total = picked.reduce((sum, s) => sum + seatPrice(base, s), 0)
  const sep = locale === 'fa' ? '، ' : ', '

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX ? [...p, id] : p))

  const seat = (r: string, i: number) => {
    const id = `${r}${i + 1}`
    const isTaken = taken.includes(id)
    const isPicked = picked.includes(id)
    const premium = /^[D-F]/.test(r)
    return (
      <button
        key={id}
        disabled={isTaken}
        onClick={() => toggle(id)}
        aria-label={`${t.seat} ${id}${isTaken ? ` (${t.taken})` : ''}`}
        aria-pressed={isPicked}
        className={`aspect-square rounded-md transition-all ${
          isTaken
            ? 'cursor-not-allowed bg-[var(--reserved)]'
            : isPicked
              ? 'scale-110 bg-[var(--accent)]'
              : `bg-[var(--avail)] hover:bg-[var(--line)] ${premium ? 'border-b-2 border-[var(--muted)]' : ''}`
        }`}
      />
    )
  }

  // دکمه‌ی ادامه: هم در نوار پایین موبایل و هم در سایدبار دسکتاپ استفاده می‌شود
  const action =
    picked.length > 0 ? (
      <Link href={`/checkout?show=${showId}&seats=${picked.join(',')}`} className={cta}>
        <span>{t.next}</span>
        <span className="flex items-center gap-2">
          {f(total)} {t.currency}
          <Chevron className="ltr:rotate-180" />
        </span>
      </Link>
    ) : (
      <span className={ctaOff}>{t.pickFirst}</span>
    )

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:px-8 lg:pb-12 lg:pt-4">
        <div className="px-5 pb-4 lg:rounded-3xl lg:bg-[var(--card)] lg:p-10">
          <Screen label={t.curtain} />
          <div dir="ltr" className="mx-auto mt-3 grid max-w-[560px] gap-y-2 lg:gap-y-2.5">
            {rows.map((r) => (
              <div key={r} className={GRID}>
                <span className="text-[10px] text-[var(--muted)]">{r}</span>
                {Array.from({ length: HALF }, (_, i) => seat(r, i))}
                <i />
                {Array.from({ length: HALF }, (_, i) => seat(r, i + HALF))}
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-5 text-xs text-[var(--muted)]">
            <Legend cls="bg-[var(--accent)]" label={t.yours} />
            <Legend cls="bg-[var(--reserved)]" label={t.taken} />
            <Legend cls="bg-[var(--avail)]" label={t.free} />
          </div>
          <p className="mt-2 text-center text-[11px] text-[var(--muted)]">{t.premium}</p>
        </div>

        <aside className="space-y-3 px-5 pb-4 pt-2 lg:sticky lg:top-6 lg:rounded-3xl lg:bg-[var(--card)] lg:p-6">
          {children}
          <div className="hidden lg:block">
            <h2 className="mb-2 mt-4 text-lg font-extrabold">{t.selected}</h2>
            {picked.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t.pickHint.replace('{n}', f(MAX))}</p>
            ) : (
              <ul className="divide-y divide-[var(--line)] text-sm">
                {picked.map((s) => (
                  <li key={s} className="flex justify-between py-2">
                    <span>
                      {t.seat} {s}
                    </span>
                    <span>
                      {f(seatPrice(base, s))} {t.currency}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-4 mt-3 flex justify-between border-t border-[var(--line)] pt-3 font-bold">
              <span>{t.total}</span>
              <span>
                {f(total)} {t.currency}
              </span>
            </div>
            {action}
            <p className="mt-3 text-xs text-[var(--muted)]">{t.hold}</p>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 bg-[var(--card)] px-4 pb-4 pt-2 lg:hidden">
        {picked.length > 0 && (
          <p className="mb-2 px-2 text-xs text-[var(--muted)]">
            {picked.join(sep)} • {t.seatsCount.replace('{n}', f(picked.length))}
          </p>
        )}
        {action}
      </div>
    </div>
  )
}

// پرده‌ی منحنی بالای صندلی‌ها
function Screen({ label }: { label: string }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-[360px]">
      <svg viewBox="0 0 320 80" className="w-full" aria-hidden>
        <defs>
          <linearGradient id="scr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.22 }} />
            <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d="M10 38 Q160 -6 310 38 L332 80 L-12 80 Z" fill="url(#scr)" />
        <path
          d="M10 38 Q160 -6 310 38"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ stroke: 'var(--accent)' }}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <i className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />
      {label}
    </span>
  )
}

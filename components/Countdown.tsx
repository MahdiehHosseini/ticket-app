'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { dict, fmt, type Locale } from '@/lib/i18n'

export default function Countdown({ expiresAt, locale }: { expiresAt: string; locale: Locale }) {
  const router = useRouter()
  const t = dict[locale]
  const f = fmt(locale)
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const end = new Date(expiresAt).getTime()
    const tick = () => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000))
      setLeft(s)
      if (s === 0) {
        clearInterval(id)
        router.refresh()
      }
    }
    const id = setInterval(tick, 1000)
    tick()
    return () => clearInterval(id)
  }, [expiresAt, router])

  const mm = left === null ? '--' : f(Math.floor(left / 60))
  const ss = left === null ? '--' : `${left % 60 < 10 ? f(0) : ''}${f(left % 60)}`

  return (
    <p
      className="flex items-center justify-between rounded-xl bg-[var(--avail)] px-4 py-3 text-sm"
      role="timer"
    >
      <span>{t.holdLeft}</span>
      <b dir="ltr" className="text-[var(--accent)] tabular-nums">
        {mm}:{ss}
      </b>
    </p>
  )
}

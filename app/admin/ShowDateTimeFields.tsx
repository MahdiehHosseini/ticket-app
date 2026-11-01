'use client'

import { useEffect, useId, useRef, useState } from 'react'

const input =
  'w-full rounded-xl bg-[var(--avail)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'

function TimeUnitPicker({
  locale,
  label,
  value,
  onChange,
  count,
}: {
  locale: 'fa' | 'en'
  label: string
  value: string
  onChange: (value: string) => void
  count: number
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const number = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { useGrouping: false })
  const display = (index: number) => number.format(index).padStart(2, locale === 'fa' ? '۰' : '0')

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const focusOption = (index: number) => {
    requestAnimationFrame(() =>
      root.current?.querySelector<HTMLButtonElement>(`[data-option="${index}"]`)?.focus(),
    )
  }

  return (
    <div ref={root} className="relative min-w-0 flex-1">
      <button
        ref={trigger}
        type="button"
        aria-label={`${label}: ${value ? display(Number(value)) : label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen(!open)
          if (!open) focusOption(value ? Number(value) : 0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            focusOption(value ? Number(value) : 0)
          }
        }}
        className={`${input} flex items-center justify-between gap-2 text-start`}
      >
        <span>{value ? display(Number(value)) : label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="me-1 size-4 shrink-0 text-[var(--muted)]"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      <input
        type="text"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInvalid={() => setOpen(true)}
        tabIndex={-1}
        aria-label={label}
        autoComplete="off"
        className="pointer-events-none absolute inset-x-0 top-0 h-9 opacity-0"
      />
      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--card)] p-1 shadow-xl backdrop-blur-lg"
        >
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              role="option"
              data-option={index}
              aria-selected={value === String(index).padStart(2, '0')}
              onClick={() => {
                onChange(String(index).padStart(2, '0'))
                setOpen(false)
                trigger.current?.focus()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false)
                  trigger.current?.focus()
                }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault()
                  focusOption((index + (event.key === 'ArrowDown' ? 1 : count - 1)) % count)
                }
              }}
              className={`mb-0.5 block w-full rounded-lg px-3 py-2 text-start text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${value === String(index).padStart(2, '0') ? 'bg-[var(--accent)] text-white' : 'text-[var(--ink)] hover:bg-[var(--avail)]'}`}
            >
              {display(index)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShowDateTimeFields({
  locale,
  dateLabel,
  timeLabel,
}: {
  locale: 'fa' | 'en'
  dateLabel: string
  timeLabel: string
}) {
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [open, setOpen] = useState(false)
  const dateLabelId = useId()
  const calendarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  })
  const language = locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US-u-ca-gregory'
  const parts = new Intl.DateTimeFormat(`${language}-nu-latn`, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const monthName = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const dateName = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const weekdayName = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' })
  const number = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { useGrouping: false })
  const dayOfMonth = (day: number) =>
    Number(parts.formatToParts(day).find((part) => part.type === 'day')?.value)
  const startOfMonth = (day: number) => day - (dayOfMonth(day) - 1) * 86400000
  const start = startOfMonth(month)
  const next = startOfMonth(start + 32 * 86400000)
  const previous = startOfMonth(start - 86400000)
  const offset = (new Date(start).getUTCDay() + (locale === 'fa' ? 1 : 0)) % 7
  const days = (next - start) / 86400000
  const dayIndex = locale === 'fa' ? 7 : 8

  return (
    <>
      <div
        ref={calendarRef}
        className="relative grid gap-1 text-xs text-[var(--muted)]"
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        <span id={dateLabelId}>{dateLabel}</span>
        <button
          type="button"
          aria-labelledby={dateLabelId}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`${input} min-h-9 text-start`}
        >
          {date ? dateName.format(new Date(`${date}T00:00:00Z`)) : dateLabel}
        </button>
        <input
          type="date"
          name="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          onInvalid={() => setOpen(true)}
          tabIndex={-1}
          aria-label={dateLabel}
          className="pointer-events-none absolute inset-x-0 top-6 h-9 opacity-0"
        />
        {open && (
          <div className="absolute end-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3 shadow-xl backdrop-blur-lg">
            <div className="mb-3 flex items-center justify-between gap-2 text-sm text-[var(--ink)]">
              <button
                type="button"
                aria-label={locale === 'fa' ? 'ماه قبل' : 'Previous month'}
                onClick={() => setMonth(previous)}
                className="rounded-lg px-2 py-1 hover:bg-[var(--avail)]"
                dir="ltr"
              >
                {locale === 'fa' ? '›' : '‹'}
              </button>
              <span className="font-bold">{monthName.format(start)}</span>
              <button
                type="button"
                aria-label={locale === 'fa' ? 'ماه بعد' : 'Next month'}
                onClick={() => setMonth(next)}
                className="rounded-lg px-2 py-1 hover:bg-[var(--avail)]"
                dir="ltr"
              >
                {locale === 'fa' ? '‹' : '›'}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="py-1 text-xs text-[var(--muted)]">
                  {weekdayName.format(Date.UTC(2023, 0, dayIndex + i))}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const day = new Date(start + i * 86400000)
                const iso = day.toISOString().slice(0, 10)
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-label={dateName.format(day)}
                    aria-pressed={date === iso}
                    onClick={() => {
                      setDate(iso)
                      setOpen(false)
                    }}
                    className={`aspect-square rounded-lg text-sm hover:bg-[var(--avail)] ${date === iso ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]' : 'text-[var(--ink)]'}`}
                  >
                    {number.format(dayOfMonth(day.getTime()))}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="grid gap-1 text-xs text-[var(--muted)]" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <span>{timeLabel}</span>
        <div className="flex items-center gap-2">
          <TimeUnitPicker
            locale={locale}
            label={locale === 'fa' ? 'ساعت' : 'Hour'}
            value={hour}
            onChange={setHour}
            count={24}
          />
          <span className="text-base">:</span>
          <TimeUnitPicker
            locale={locale}
            label={locale === 'fa' ? 'دقیقه' : 'Minute'}
            value={minute}
            onChange={setMinute}
            count={60}
          />
          <input type="hidden" name="time" value={hour && minute ? `${hour}:${minute}` : ''} />
        </div>
      </div>
    </>
  )
}

'use client'

import { useEffect, useId, useRef, useState } from 'react'

export default function HallPicker({ locale, label }: { locale: 'fa' | 'en'; label: string }) {
  const [hall, setHall] = useState(1)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const labelId = useId()
  const menuId = useId()
  const number = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US')

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const focusOption = (hallNumber: number) => {
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>(`[data-hall="${hallNumber}"]`)?.focus())
  }

  return (
    <div ref={root} className="relative grid gap-1 text-xs text-[var(--muted)]" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <span id={labelId}>{label}</span>
      <input type="hidden" name="hall" value={hall} />
      <button
        ref={trigger}
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex w-full items-center justify-between rounded-xl bg-[var(--avail)] px-3 py-2 text-start text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            focusOption(hall)
          }
        }}
      >
        <span>{number.format(hall)}</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="me-1 size-4 text-[var(--muted)]">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div id={menuId} role="listbox" aria-labelledby={labelId} className="absolute inset-x-0 top-full z-30 mt-2 grid gap-1 rounded-xl border border-[var(--line)] bg-[var(--card)] p-1 shadow-xl">
          {[1, 2, 3].map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              data-hall={option}
              aria-selected={hall === option}
              className={`rounded-lg px-3 py-2 text-start text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${hall === option ? 'bg-[var(--accent)] text-white' : 'text-[var(--ink)] hover:bg-[var(--avail)]'}`}
              onClick={() => { setHall(option); setOpen(false); trigger.current?.focus() }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault()
                  focusOption((option + (event.key === 'ArrowDown' ? 0 : 1)) % 3 + 1)
                }
              }}
            >
              {number.format(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const p = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

// کلاس‌های مشترک دکمه‌ها
export const iconBase = 'grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors'
export const iconBtn = `${iconBase} bg-[var(--avail)] text-[var(--ink)] hover:bg-[var(--line)]`
const ctaBase = 'flex w-full items-center justify-between rounded-full px-6 py-4 font-bold'
export const cta = `${ctaBase} cta-grad`
export const ctaOff = `${ctaBase} cursor-not-allowed bg-[var(--avail)] text-[var(--muted)]`

// فلش به چپ؛ در راست‌به‌چپ «بازگشت» با rtl:rotate-180 و «ادامه» بدون چرخش، در انگلیسی برعکس
export const Chevron = ({ className = '' }: { className?: string }) => (
  <svg {...p} className={className}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)
export const Ticket = () => (
  <svg {...p}>
    <path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z" />
    <path d="M14 6v12" strokeDasharray="2 3" />
  </svg>
)
export const Sun = () => (
  <svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
export const Moon = () => (
  <svg {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

const Star = ({ on }: { on: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    aria-hidden
    style={{ fill: on ? 'var(--accent)' : 'var(--line)' }}
  >
    <path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.3L12 18l-6.5 3.9 1.7-7.3-5.7-5L9 8.9z" />
  </svg>
)

// امتیاز از ۱۰ را به ۵ ستاره تبدیل می‌کند
export function Stars({ rating }: { rating: string }) {
  const n = Math.round(parseFloat(rating) / 2)
  return (
    <span className="flex gap-0.5" aria-label={`${rating}/10`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} on={i < n} />
      ))}
    </span>
  )
}

export const Search = () => (
  <svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

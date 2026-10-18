import type { Event } from '@/lib/data'
import { pick, type Locale } from '@/lib/i18n'

const art = { card: 'text-5xl', small: 'text-2xl', hero: 'text-6xl' }

// تا وقتی پوستر واقعی نداریم: گرادیان رنگی لایه‌لایه + نور، سایه‌ی رنگی و اسم فیلم به‌صورت طرح کم‌رنگ
export default function Poster({
  event,
  locale,
  variant = 'card',
  className = '',
}: {
  event: Event
  locale: Locale
  variant?: keyof typeof art
  className?: string
}) {
  const [c0, c1] = event.colors
  return (
    <div
      className={`relative isolate overflow-hidden text-white ${variant === 'hero' ? '' : 'rounded-3xl'} ${className}`}
      style={{
        background: `linear-gradient(155deg, ${c0}, ${c1})`,
        boxShadow: variant === 'hero' ? undefined : `0 30px 50px -24px ${c1}`,
      }}
    >
      <i
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 80% 0%, rgba(255,255,255,.35), transparent 55%), radial-gradient(100% 70% at 10% 100%, rgba(0,0,0,.5), transparent 60%)',
        }}
      />
      <i className="blob absolute -end-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
      <i className="blob blob-b absolute -start-10 -bottom-16 h-52 w-52 rounded-full bg-black/30 blur-2xl" />
      <span
        aria-hidden
        className={`absolute inset-0 grid place-items-center px-3 text-center leading-tight font-extrabold opacity-25 ${art[variant]}`}
      >
        {pick(event.title, locale)}
      </span>
      <i className="shine absolute inset-0" />
    </div>
  )
}

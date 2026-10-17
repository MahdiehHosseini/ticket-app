import type { Event } from '@/lib/data'
import { pick, type Locale } from '@/lib/i18n'

const art = { card: 'text-5xl', small: 'text-2xl', hero: 'text-6xl' }

// تا وقتی پوستر واقعی نداریم: گرادیان رنگی + نام فیلم به‌صورت طرح کم‌رنگ
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
  return (
    <div
      className={`relative isolate overflow-hidden text-white ${variant === 'hero' ? '' : 'rounded-3xl'} ${className}`}
      style={{
        background: `linear-gradient(155deg, ${event.colors[0]}, ${event.colors[1]})`,
      }}
    >
      <i className="absolute -end-12 -top-12 h-44 w-44 rounded-full bg-white/15" />
      <i className="absolute -bottom-20 -start-12 h-56 w-56 rounded-full bg-black/20" />
      <span
        aria-hidden
        className={`absolute inset-0 grid place-items-center px-3 text-center font-extrabold leading-tight opacity-25 ${art[variant]}`}
      >
        {pick(event.title, locale)}
      </span>
    </div>
  )
}

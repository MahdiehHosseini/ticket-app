import Image from 'next/image';
import type { Event } from '@/lib/data';
import { pick, type Locale } from '@/lib/i18n';

const art = { card: 'text-5xl', small: 'text-2xl', hero: 'text-6xl' };

// اگر event.poster باشد عکس نشان داده می‌شود، وگرنه گرادیان رنگی لایه‌لایه با اسم فیلم به‌صورت طرح کم‌رنگ
export default function Poster({ event, locale, variant = 'card', className = '' }: { event: Event; locale: Locale; variant?: keyof typeof art; className?: string }) {
  const [c0, c1] = event.colors
  const title = pick(event.title, locale)
  const src = event.poster

  return (
    <div
      className={`relative isolate overflow-hidden text-white ${variant === 'hero' ? '' : 'rounded-3xl'} ${className}`}
      style={{ background: `linear-gradient(155deg, ${c0}, ${c1})`, boxShadow: variant === 'hero' ? undefined : `0 30px 50px -24px ${c1}` }}
    >
      {src ? (
        <>
          {src.startsWith('http') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-left" />
          ) : (
            <Image src={src} alt={title} fill priority={variant === 'hero'} sizes={variant === 'hero' ? '100vw' : '(min-width: 1024px) 25vw, 66vw'} className="object-cover object-left" />
          )}
          {/* لایه‌ی تیره برای خوانایی نشان‌ها و متن روی عکس */}
          <i className="absolute inset-0" style={{ background: variant === 'hero' ? 'rgba(0,0,0,.42)' : 'linear-gradient(to top, rgba(0,0,0,.55), transparent 55%)' }} />
        </>
      ) : (
        <>
          <i className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 80% 0%, rgba(255,255,255,.35), transparent 55%), radial-gradient(100% 70% at 10% 100%, rgba(0,0,0,.5), transparent 60%)' }} />
          <i className="blob absolute -end-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
          <i className="blob blob-b absolute -bottom-16 -start-10 h-52 w-52 rounded-full bg-black/30 blur-2xl" />
          <span aria-hidden className={`absolute inset-0 grid place-items-center px-3 text-center font-extrabold leading-tight opacity-25 ${art[variant]}`}>{title}</span>
        </>
      )}
      <i className="shine absolute inset-0" />
    </div>
  );
}

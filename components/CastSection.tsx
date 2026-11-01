import Image from 'next/image'
import { getCast } from '@/lib/cast'
import { pick, type Locale } from '@/lib/i18n'

// بازیگران و عوامل: ردیف افقی قابل اسکرول (روی دسکتاپ چندخطی). بدون عکس، حرف اول اسم نشان داده می‌شود.
export default async function CastSection({ eventId, locale }: { eventId: string; locale: Locale }) {
  const cast = await getCast(eventId)
  if (cast.length === 0) return null

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-extrabold">{locale === 'fa' ? 'بازیگران و عوامل' : 'Cast & crew'}</h2>
      <ul className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {cast.map((c, i) => {
          const name = pick(c.name, locale)
          return (
            <li key={c.id} className="rise w-20 shrink-0 text-center" style={{ '--i': i } as React.CSSProperties}>
              <div
                className="relative mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full text-2xl font-extrabold text-white ring-2 ring-[var(--line)]"
                style={{ background: 'linear-gradient(135deg, #ff3d77, #ff8a4c)' }}
              >
                {c.photo ? (
                  c.photo.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Image src={c.photo} alt={name} fill sizes="80px" className="object-cover" />
                  )
                ) : (
                  name.charAt(0)
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-5">{name}</p>
              {c.role && <p className="line-clamp-2 text-[11px] leading-4 text-[var(--muted)]">{pick(c.role, locale)}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import Link from 'next/link'
import { deleteReview } from '@/app/reviews/actions'
import { digits, fmt, type Locale } from '@/lib/i18n'
import { R } from '@/lib/reviewText'
import { blended, canReview, getDistribution, getMyReview, getReviews } from '@/lib/reviews'
import { getUserId } from '@/lib/user'
import { Stars } from './Icons'
import ReviewForm from './ReviewForm'

// base = امتیاز اولیه‌ی فیلم (برای ترکیب با نظرها)
export default async function ReviewSection({ eventId, base, locale }: { eventId: string; base: string; locale: Locale }) {
  const r = R[locale]
  const f = fmt(locale)
  const userId = await getUserId()
  const [dist, list, eligible, mine] = await Promise.all([
    getDistribution(eventId),
    getReviews(eventId),
    userId ? canReview(userId, eventId) : false,
    userId ? getMyReview(eventId, userId) : null,
  ])
  const n = dist.reduce((a, b) => a + b, 0)
  const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0)
  const rating = blended(base, { n, sum })
  const date = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', { dateStyle: 'medium', timeZone: 'Asia/Tehran' })

  return (
    <section className="mt-10 border-t border-[var(--line)] pt-8">
      <h2 className="text-lg font-extrabold">{r.title}</h2>

      <div className="mt-4 flex flex-wrap items-center gap-8">
        <div className="grid justify-items-center gap-1">
          <p className="text-5xl font-extrabold leading-none">{digits(rating, locale)}</p>
          <Stars rating={rating} />
          <p className="text-xs text-[var(--muted)]">{r.count.replace('{n}', f(n))}</p>
        </div>
        <div className="grid min-w-48 flex-1 gap-1.5" dir="ltr">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="w-3 text-center">{f(s)}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--avail)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${n ? (dist[s - 1] / n) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-end">{f(dist[s - 1])}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">{r.note}</p>

      {!userId ? (
        <p className="mt-6 text-sm">
          {r.needLogin}{' '}
          <Link href={`/login?next=${encodeURIComponent(`/events/${eventId}`)}`} className="font-bold text-[var(--accent)]">{r.login}</Link>
        </p>
      ) : !eligible ? (
        <p className="mt-6 rounded-2xl bg-[var(--avail)] p-4 text-sm text-[var(--muted)]">{r.onlyViewers}</p>
      ) : (
        <>
          <ReviewForm eventId={eventId} locale={locale} initial={mine} />
          {mine && (
            <form action={deleteReview.bind(null, eventId)} className="mt-2">
              <button className="text-xs font-bold text-[var(--muted)] hover:text-[var(--accent)]">{r.del}</button>
            </form>
          )}
        </>
      )}

      <ul className="mt-6 grid gap-4">
        {list.length === 0 && <li className="text-sm text-[var(--muted)]">{r.none}</li>}
        {list.map((x) => (
          <li key={x.userId} className="rounded-2xl bg-[var(--avail)] p-4">
            <div className="flex items-center gap-3">
              <span className="cta-grad grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold">{(x.name ?? r.user).charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{x.name ?? r.user}</p>
                <p className="text-xs text-[var(--muted)]">{r.verified} • {date.format(x.createdAt)}</p>
              </div>
              <Stars rating={String(x.stars * 2)} />
            </div>
            {x.comment && <p className="mt-3 whitespace-pre-line break-words text-sm leading-7">{x.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

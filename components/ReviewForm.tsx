'use client'
import { useActionState, useState } from 'react'
import { saveReview } from '@/app/reviews/actions'
import type { Locale } from '@/lib/i18n'
import { R, type ReviewState } from '@/lib/reviewText'
import { cta } from './Icons'

export default function ReviewForm({ eventId, locale, initial }: { eventId: string; locale: Locale; initial: { stars: number; comment: string } | null }) {
  const r = R[locale]
  const [stars, setStars] = useState(initial?.stars ?? 0)
  const [state, action, pending] = useActionState<ReviewState, FormData>(saveReview.bind(null, eventId), null)
  const error = { stars: r.errStars, long: r.errLong, access: r.errAccess, auth: r.errAuth }[state?.error ?? 'stars']

  return (
    <form action={action} className="mt-6 grid gap-3 rounded-2xl bg-[var(--avail)] p-4">
      <p className="text-sm font-bold">{initial ? r.yourReview : r.rate}</p>
      <div role="radiogroup" aria-label={r.rate} dir="ltr" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i} type="button" role="radio" aria-checked={stars === i} aria-label={String(i)} onClick={() => setStars(i)}
            className="text-3xl leading-none transition-transform hover:scale-125 active:scale-95"
            style={{ color: i <= stars ? 'var(--accent)' : 'var(--line)' }}
          >
            ★
          </button>
        ))}
      </div>
      <input type="hidden" name="stars" value={stars} />
      <textarea
        name="comment" rows={3} maxLength={1000} dir="auto" defaultValue={initial?.comment ?? ''} placeholder={r.comment}
        className="w-full resize-y rounded-xl bg-[var(--card)] px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
      {state?.error && <p role="alert" className="text-sm text-[var(--accent)]">{error}</p>}
      {state?.ok && <p role="status" className="text-sm text-emerald-500">{r.saved}</p>}
      <button disabled={pending || stars === 0} className={`${cta} disabled:opacity-60`}>
        <span>{initial ? r.update : r.send}</span>
      </button>
    </form>
  )
}

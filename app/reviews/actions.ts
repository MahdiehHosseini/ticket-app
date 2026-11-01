'use server'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { reviews } from '@/db/schema'
import type { ReviewState } from '@/lib/reviewText'
import { canReview } from '@/lib/reviews'
import { getUserId } from '@/lib/user'

const refresh = (eventId: string) => {
  revalidatePath(`/events/${eventId}`)
  revalidatePath('/')
}

export async function saveReview(eventId: string, _prev: ReviewState, form: FormData): Promise<ReviewState> {
  const userId = await getUserId()
  if (!userId) return { error: 'auth' }

  const stars = Number(form.get('stars'))
  const comment = String(form.get('comment') ?? '').trim()
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: 'stars' }
  if (comment.length > 1000) return { error: 'long' }
  // دسترسی همیشه سمت سرور چک می‌شود (فرم را می‌شود مستقیم صدا زد)
  if (!(await canReview(userId, eventId))) return { error: 'access' }

  await db
    .insert(reviews)
    .values({ eventId, userId, stars, comment })
    .onConflictDoUpdate({ target: [reviews.eventId, reviews.userId], set: { stars, comment, updatedAt: new Date() } })
  refresh(eventId)
  return { ok: true }
}

export async function deleteReview(eventId: string) {
  const userId = await getUserId()
  if (!userId) return
  await db.delete(reviews).where(and(eq(reviews.eventId, eventId), eq(reviews.userId, userId)))
  refresh(eventId)
}

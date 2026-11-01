'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { normalizePhone, type ProfileState } from '@/lib/profile'
import { getUserId } from '@/lib/user'

export async function saveProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const userId = await getUserId()
  if (!userId) return { error: 'auth' }

  const clean = (k: string) => String(form.get(k) ?? '').replace(/\s+/g, ' ').trim()
  const firstName = clean('firstName')
  const lastName = clean('lastName')
  const rawPhone = clean('phone')

  if (firstName.length > 60 || lastName.length > 60) return { error: 'name' }
  const phone = rawPhone ? normalizePhone(rawPhone) : null
  if (rawPhone && !phone) return { error: 'phone' }

  await db
    .insert(profiles)
    .values({ userId, firstName, lastName, phone })
    .onConflictDoUpdate({ target: profiles.userId, set: { firstName, lastName, phone, updatedAt: new Date() } })

  revalidatePath('/profile')
  return { ok: true }
}

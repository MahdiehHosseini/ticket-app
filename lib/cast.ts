import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { castMembers } from '@/db/schema'
import type { L } from './i18n'

export type CastMember = { id: number; name: L; role?: L; photo?: string }

export async function getCast(eventId: string): Promise<CastMember[]> {
  const r = await db.select().from(castMembers).where(eq(castMembers.eventId, eventId)).orderBy(asc(castMembers.position), asc(castMembers.id))
  return r.map((x) => ({
    id: x.id,
    name: { fa: x.nameFa, en: x.nameEn },
    role: x.roleFa || x.roleEn ? { fa: x.roleFa ?? x.roleEn ?? '', en: x.roleEn ?? x.roleFa ?? '' } : undefined,
    photo: x.photo ?? undefined,
  }))
}

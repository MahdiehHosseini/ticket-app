import { auth } from '@/auth'

export async function getUserId() {
  const s = await auth()
  return (s?.user as { id?: string } | undefined)?.id
}

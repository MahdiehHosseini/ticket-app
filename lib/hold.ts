import { cookies } from 'next/headers'

// شناسه‌ی ناشناس مرورگر برای نگه‌داری صندلی (تا قبل از احراز هویت)
export async function getHoldToken() {
  return (await cookies()).get('hold')?.value
}

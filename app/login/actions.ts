'use server';
import { AuthError } from 'next-auth';
import { headers } from 'next/headers';
import { signIn } from '@/auth';
import { requestOtp } from '@/lib/otp';

// فقط مسیرهای داخلی سایت (جلوگیری از redirect به سایت دیگر)
const safePath = (p: string) => (p.startsWith('/') && !p.startsWith('//') ? p : '/');

export async function requestEmailCode(email: string) {
  const h = await headers();
  const ip = h.get('x-nf-client-connection-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return requestOtp(email, ip);
}

export async function verifyEmailCode(email: string, code: string, next: string): Promise<{ error: 'invalid' } | undefined> {
  try {
    await signIn('email-otp', { email, code, redirectTo: safePath(next) });
  } catch (e) {
    if (e instanceof AuthError) return { error: 'invalid' };
    throw e; // redirect موفق هم با throw کار می‌کند و باید رد شود
  }
}

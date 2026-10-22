import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { and, count, desc, eq, gt, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { otpCodes } from '@/db/schema';
import { sendCode } from './mail';

const MAX_ATTEMPTS = 5;
const TTL_MIN = 10;

export function normalizeEmail(v: string) {
  const e = v.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

// hash با کلید سرور: حتی با دسترسی به دیتابیس نمی‌شود کد را از روی hash حدس زد
const hash = (email: string, code: string) =>
  createHmac('sha256', process.env.AUTH_SECRET ?? '').update(`${email}:${code}`).digest('hex');

type Requested = { ok: true; demoCode?: string } | { ok: false; reason: 'invalid' | 'rate' | 'send' };

export async function requestOtp(rawEmail: string, ip: string): Promise<Requested> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { ok: false, reason: 'invalid' };

  await db.delete(otpCodes).where(lt(otpCodes.createdAt, sql`now() - interval '1 day'`));

  // محدودیت نرخ: هر ایمیل یک کد در ۶۰ ثانیه و ۵ کد در ساعت، هر IP حداکثر ۱۰ کد در ساعت
  const n = async (where: ReturnType<typeof and>) => (await db.select({ n: count() }).from(otpCodes).where(where))[0].n;
  const [lastMinute, hourEmail, hourIp] = await Promise.all([
    n(and(eq(otpCodes.email, email), gt(otpCodes.createdAt, sql`now() - interval '60 seconds'`))),
    n(and(eq(otpCodes.email, email), gt(otpCodes.createdAt, sql`now() - interval '1 hour'`))),
    n(and(eq(otpCodes.ip, ip), gt(otpCodes.createdAt, sql`now() - interval '1 hour'`))),
  ]);
  if (lastMinute > 0 || hourEmail >= 5 || hourIp >= 10) return { ok: false, reason: 'rate' };

  const code = String(randomInt(100_000, 1_000_000));
  const [row] = await db
    .insert(otpCodes)
    .values({ email, ip, codeHash: hash(email, code), expiresAt: new Date(Date.now() + TTL_MIN * 60_000) })
    .returning({ id: otpCodes.id });

  try {
    const { delivered } = await sendCode(email, code);
    if (!delivered) {
      // بدون سرویس ایمیل: فقط با OTP_DEMO=true کد به کاربر نشان داده می‌شود (دموی رزومه، نه سایت واقعی)
      if (process.env.OTP_DEMO === 'true') return { ok: true, demoCode: code };
      if (process.env.NODE_ENV === 'production') throw new Error('mail not configured');
    }
  } catch {
    await db.delete(otpCodes).where(eq(otpCodes.id, row.id));
    return { ok: false, reason: 'send' };
  }
  return { ok: true };
}

// کد درست = یک بار مصرف: «حذف» ردیف اتمیک است، پس دو درخواست همزمان نمی‌توانند هر دو موفق شوند
export async function verifyOtp(rawEmail: string, code: string): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  if (!email) return false;

  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), gt(otpCodes.expiresAt, sql`now()`), lt(otpCodes.attempts, MAX_ATTEMPTS)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  if (!row) return false;

  // تلاش را «قبل از» مقایسه می‌شماریم (سقف ۵ بار برای هر کد)
  const [claimed] = await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(and(eq(otpCodes.id, row.id), lt(otpCodes.attempts, MAX_ATTEMPTS)))
    .returning({ id: otpCodes.id });
  if (!claimed) return false;

  if (!timingSafeEqual(Buffer.from(row.codeHash), Buffer.from(hash(email, code)))) return false;

  const [used] = await db.delete(otpCodes).where(eq(otpCodes.id, row.id)).returning({ id: otpCodes.id });
  if (!used) return false;
  await db.delete(otpCodes).where(eq(otpCodes.email, email)); // بقیه‌ی کدهای این ایمیل هم باطل
  return true;
}

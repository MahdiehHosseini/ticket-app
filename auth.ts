import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { normalizeEmail, verifyOtp } from '@/lib/otp';

// نشست JWT، بدون دیتابیس. شناسه‌ی کاربر همان id حساب گیت‌هاب است.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    // ورود با کد یک‌بارمصرف ایمیل. شناسه‌ی کاربر: email:<آدرس>
    Credentials({
      id: 'email-otp',
      credentials: { email: {}, code: {} },
      async authorize(c) {
        const email = normalizeEmail(String(c?.email ?? ''));
        const code = String(c?.code ?? '').trim();
        if (!email || !/^\d{6}$/.test(code) || !(await verifyOtp(email, code))) return null;
        return { id: `email:${email}`, email, name: email.split('@')[0] };
      },
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.login = login; // نام کاربری گیت‌هاب، برای تشخیص ادمین
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.sub, login: token.login });
      return session;
    },
  },
});

import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// نشست JWT، بدون دیتابیس. شناسه‌ی کاربر همان id حساب گیت‌هاب است.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    session({ session, token }) {
      (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
});

import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

// نشست JWT، بدون دیتابیس. شناسه‌ی کاربر همان id حساب گیت‌هاب است.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login
      if (login) token.login = login // نام کاربری گیت‌هاب، برای تشخیص ادمین
      return token
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.sub, login: token.login })
      return session
    },
  },
})

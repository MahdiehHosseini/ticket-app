import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'
import { dict } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { iconBtn, Ticket } from './Icons'
import Toggles from './Toggles'
import { adminFromSession } from '@/lib/admin'

const pill =
  'rounded-full bg-[var(--avail)] px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--line)]'

export default async function AppBar() {
  const [{ locale, theme }, session] = await Promise.all([getPrefs(), auth()])
  const t = dict[locale]
  return (
    <header className="flex items-center justify-between gap-4 px-5 pt-6 lg:px-8">
      <Link href="/" className="text-lg font-extrabold lg:text-2xl">
        {t.brand}
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
        <Link href="/" className="hover:text-[var(--accent)]">
          {t.movies}
        </Link>
        <Link href="/tickets" className="hover:text-[var(--accent)]">
          {t.myTickets}
        </Link>
        {adminFromSession(session) && (
          <Link href="/admin" className="hover:text-[var(--accent)]">
            Admin
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/tickets" className={`${iconBtn} md:hidden`} aria-label={t.myTickets}>
          <Ticket />
        </Link>
        <Toggles locale={locale} theme={theme} />
        {session?.user ? (
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button className={pill}>{t.signOut}</button>
          </form>
        ) : (
          <form
            action={async () => {
              'use server'
              await signIn('github')
            }}
          >
            <button className={pill}>{t.signIn}</button>
          </form>
        )}
      </div>
    </header>
  )
}

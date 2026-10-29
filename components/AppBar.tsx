import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { adminFromSession } from '@/lib/admin';
import { dict } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import { iconBtn, Ticket } from './Icons';
import Toggles from './Toggles';

const pill = 'rounded-full bg-[var(--avail)] px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--line)]';

export default async function AppBar() {
  const [{ locale, theme }, session] = await Promise.all([getPrefs(), auth()]);
  const t = dict[locale];
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
      <Link href="/" className="text-lg font-extrabold tracking-tight lg:text-2xl"><span className="bg-gradient-to-l from-[var(--accent)] to-[#ff8a4c] bg-clip-text text-transparent">{t.brand}</span></Link>
        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
          <Link href="/" className="rounded-full px-4 py-2 transition-colors hover:bg-[var(--avail)] hover:text-[var(--accent)]">{t.movies}</Link>
          <Link href="/tickets" className="rounded-full px-4 py-2 transition-colors hover:bg-[var(--avail)] hover:text-[var(--accent)]">{t.myTickets}</Link>
          {adminFromSession(session) && <Link href="/admin" className="rounded-full px-4 py-2 transition-colors hover:bg-[var(--avail)] hover:text-[var(--accent)]">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/tickets" className={`${iconBtn} md:hidden`} aria-label={t.myTickets}><Ticket /></Link>
          <Toggles locale={locale} theme={theme} />
          {session?.user ? (
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
              <button className={`${pill} h-10`}>{t.signOut}</button>
            </form>
          ) : (
            <Link href="/login" className={`${pill} cta-grad h-10 flex items-center border-0 text-white`}>{t.signIn}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
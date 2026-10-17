import Link from 'next/link'
import Toggles from './Toggles'
import { dict } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'

export default async function Header() {
  const { locale, theme } = await getPrefs()
  const t = dict[locale]
  return (
    <header className="border-b border-[var(--line)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold text-[var(--curtain)]">
          {t.brand}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-[var(--curtain)]">
            {t.events}
          </Link>
          <Link href="/tickets" className="hover:text-[var(--curtain)]">
            {t.myTickets}
          </Link>
          <Toggles locale={locale} theme={theme} />
        </nav>
      </div>
    </header>
  )
}

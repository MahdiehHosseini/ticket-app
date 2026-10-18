import { cookies } from 'next/headers'
import type { Locale } from './i18n'

export async function getPrefs() {
  const c = await cookies()
  const locale: Locale = c.get('locale')?.value === 'en' ? 'en' : 'fa'
  const theme: 'light' | 'dark' = c.get('theme')?.value === 'light' ? 'light' : 'dark'
  return { locale, theme }
}

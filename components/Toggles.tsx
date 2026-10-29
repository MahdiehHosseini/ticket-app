'use client'
import { useRouter } from 'next/navigation'
import { dict, type Locale } from '@/lib/i18n'
import { iconBtn, Moon, Sun } from './Icons'

const setCookie = (k: string, v: string) => {
  document.cookie = `${k}=${v}; path=/; max-age=31536000; samesite=lax`
}

export default function Toggles({ locale, theme }: { locale: Locale; theme: 'light' | 'dark' }) {
  const router = useRouter()
  const t = dict[locale]

  const flipLocale = () => {
    const next: Locale = locale === 'fa' ? 'en' : 'fa'
    setCookie('locale', next)
    const d = document.documentElement
    d.lang = next
    d.dir = next === 'fa' ? 'rtl' : 'ltr'
    router.refresh()
  }
  const flipTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setCookie('theme', next)
    document.documentElement.dataset.theme = next
    router.refresh()
  }

  return (
    <>
      <button
        onClick={flipTheme}
        className={iconBtn}
        aria-label={theme === 'dark' ? t.light : t.dark}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </button>
      <button onClick={flipLocale} className={`${iconBtn} w-16 text-xs font-bold`}>
        {t.other}
      </button>
    </>
  )
}

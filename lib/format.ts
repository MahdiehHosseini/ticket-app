import type { Locale } from './i18n'

const TZ = 'Asia/Tehran'

// کلید یکتای روز (برای گروه‌بندی سانس‌ها)
export const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })

// عدد روز و نام کوتاه روز هفته برای چیپ تاریخ
export function dayChip(iso: string, l: Locale) {
  const d = new Date(iso)
  const loc = l === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US'
  return {
    num: new Intl.DateTimeFormat(loc, { day: 'numeric', timeZone: TZ }).format(d),
    wd: new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: TZ }).format(d),
  }
}

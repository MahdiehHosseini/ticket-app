'use client'
import { useActionState } from 'react'
import { saveProfile } from '@/app/profile/actions'
import type { Locale } from '@/lib/i18n'
import type { ProfileState } from '@/lib/profile'
import { cta } from './Icons'

const A = {
  fa: { email: 'ایمیل', noEmail: 'ایمیلی ثبت نشده', firstName: 'نام', lastName: 'نام خانوادگی', phone: 'شماره موبایل',
    save: 'ذخیره', saved: 'اطلاعات ذخیره شد.', errName: 'نام یا نام خانوادگی خیلی طولانی است.',
    errPhone: 'شماره موبایل معتبر نیست.', errAuth: 'ابتدا وارد شو.', hint: 'این اطلاعات فرم پرداخت را خودکار پر می‌کند.' },
  en: { email: 'Email', noEmail: 'No email on file', firstName: 'First name', lastName: 'Last name', phone: 'Mobile number',
    save: 'Save', saved: 'Saved.', errName: 'Name is too long.', errPhone: 'Enter a valid mobile number.',
    errAuth: 'Please sign in first.', hint: 'Used to pre-fill the checkout form.' },
} as const

const input = 'w-full rounded-xl bg-[var(--avail)] px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'

export default function ProfileForm({
  locale, email, defaults,
}: { locale: Locale; email: string; defaults: { firstName: string; lastName: string; phone: string } }) {
  const a = A[locale]
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, null)
  const error = state?.error === 'name' ? a.errName : state?.error === 'phone' ? a.errPhone : state?.error === 'auth' ? a.errAuth : ''

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        {a.email}
        <input dir="ltr" value={email || a.noEmail} readOnly disabled className={`${input} cursor-not-allowed opacity-70`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          {a.firstName}
          <input name="firstName" dir="auto" maxLength={60} autoComplete="given-name" defaultValue={defaults.firstName} className={input} />
        </label>
        <label className="grid gap-1 text-sm">
          {a.lastName}
          <input name="lastName" dir="auto" maxLength={60} autoComplete="family-name" defaultValue={defaults.lastName} className={input} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        {a.phone}
        <input name="phone" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09123456789" defaultValue={defaults.phone} className={input} />
      </label>
      <p className="text-xs text-[var(--muted)]">{a.hint}</p>

      {error && <p role="alert" className="text-sm text-[var(--accent)]">{error}</p>}
      {state?.ok && <p role="status" className="text-sm text-emerald-500">{a.saved}</p>}

      <button disabled={pending} className={`${cta} disabled:opacity-60`}>
        <span>{a.save}</span>
      </button>
    </form>
  )
}

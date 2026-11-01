import { Suspense } from 'react'
import { auth } from '@/auth'
import AppBar from '@/components/AppBar'
import LoginGate from '@/components/LoginGate'
import ProfileForm from '@/components/ProfileForm'
import Skeleton from '@/components/Skeleton'
import { dict } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getProfile } from '@/lib/profile'
import { getUserId } from '@/lib/user'

export const metadata = { robots: { index: false, follow: false } }

async function Content() {
  const { locale } = await getPrefs()
  const t = dict[locale]
  const userId = await getUserId()
  const head = (
    <div className="lg:hidden">
      <AppBar />
    </div>
  )

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col">
        {head}
        <LoginGate locale={locale} redirectTo="/profile" message={t.loginToSee} />
      </div>
    )
  }

  const [session, profile] = await Promise.all([auth(), getProfile(userId)])
  const email = session?.user?.email ?? ''
  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
  const initial = (displayName || email || '?').charAt(0).toUpperCase()

  return (
    <div className="flex flex-1 flex-col">
      {head}
      <div className="mx-auto w-full max-w-lg px-5 py-8">
        <div className="rise grid gap-6 rounded-3xl bg-[var(--card)] p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <span className="cta-grad grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-extrabold">{initial}</span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold">{displayName || t.profile}</h1>
              <p dir="ltr" className="truncate text-sm text-[var(--muted)]">{email}</p>
            </div>
          </div>
          <ProfileForm
            locale={locale}
            email={email}
            defaults={{ firstName: profile?.firstName ?? '', lastName: profile?.lastName ?? '', phone: profile?.phone ?? '' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  )
}

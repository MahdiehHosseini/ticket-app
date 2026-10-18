import { signIn } from '@/auth'
import { dict, type Locale } from '@/lib/i18n'
import { Chevron, cta } from './Icons'

export default function LoginGate({
  locale,
  redirectTo,
  message,
}: {
  locale: Locale
  redirectTo: string
  message: string
}) {
  const t = dict[locale]
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <p className="text-lg font-bold">{message}</p>
      <form
        action={async () => {
          'use server'
          await signIn('github', { redirectTo })
        }}
        className="w-full max-w-xs"
      >
        <button className={cta}>
          <span>{t.loginGithub}</span>
          <Chevron className="ltr:rotate-180" />
        </button>
      </form>
    </div>
  )
}

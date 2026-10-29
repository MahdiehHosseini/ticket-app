import { Suspense } from 'react';
import AppBar from '@/components/AppBar';
import LoginForm from '@/components/LoginForm';
import Skeleton from '@/components/Skeleton';
import { signIn } from '@/auth';
import { getPrefs } from '@/lib/prefs';

export const metadata = { robots: { index: false, follow: false } };

const T = {
  fa: { title: 'ورود به حساب', or: 'یا', github: 'ادامه با GitHub' },
  en: { title: 'Sign in', or: 'or', github: 'Continue with GitHub' },
} as const;

async function Content({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '/' } = await searchParams;
  const { locale } = await getPrefs();
  const t = T[locale];
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  return (
    <div className="flex flex-1 flex-col">
      <div className="lg:hidden"><AppBar /></div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="rise grid gap-5 rounded-3xl bg-[var(--card)] p-6 lg:p-8">
          <h1 className="text-2xl font-extrabold">{t.title}</h1>
          <LoginForm locale={locale} next={safe} />
          <form action={async () => { 'use server'; await signIn('github', { redirectTo: safe }); }}>
            <button className="rounded-full bg-[var(--avail)] px-4 py-2 text-13px font-bold transition-colors hover:bg-[var(--line)]">{t.github}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Login(props: { searchParams: Promise<{ next?: string }> }) {
  return <Suspense fallback={<Skeleton />}><Content {...props} /></Suspense>
}

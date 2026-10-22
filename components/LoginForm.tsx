'use client';
import { useState, useTransition } from 'react';
import { requestEmailCode, verifyEmailCode } from '@/app/login/actions';
import type { Locale } from '@/lib/i18n';
import { Chevron, cta } from './Icons';

const A = {
  fa: { email: 'ایمیل', send: 'ارسال کد', code: 'کد ۶ رقمی', verify: 'تأیید و ورود', resend: 'ارسال دوباره', change: 'تغییر ایمیل',
    sent: 'کد به این ایمیل ارسال شد:', demo: 'حالت دمو، کد شما:', invalidEmail: 'ایمیل معتبر نیست.', tooMany: 'درخواست‌ها زیاد است. کمی بعد دوباره تلاش کن.',
    sendFailed: 'ارسال ایمیل ناموفق بود.', invalidCode: 'کد اشتباه است یا منقضی شده.' },
  en: { email: 'Email', send: 'Send code', code: '6-digit code', verify: 'Verify and sign in', resend: 'Resend', change: 'Change email',
    sent: 'We sent a code to:', demo: 'Demo mode, your code:', invalidEmail: 'Enter a valid email.', tooMany: 'Too many requests. Try again shortly.',
    sendFailed: "Couldn't send the email.", invalidCode: 'Wrong or expired code.' },
} as const;

const input = 'w-full rounded-xl bg-[var(--avail)] px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]';

export default function LoginForm({ locale, next }: { locale: Locale; next: string }) {
  const a = A[locale];
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [demo, setDemo] = useState('');
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      setMsg('');
      const r = await requestEmailCode(email);
      if (!r.ok) return setMsg(r.reason === 'invalid' ? a.invalidEmail : r.reason === 'rate' ? a.tooMany : a.sendFailed);
      setDemo(r.demoCode ?? '');
      setCode('');
      setStep('code');
    });

  const verify = () =>
    start(async () => {
      setMsg('');
      const r = await verifyEmailCode(email, code, next); // موفق: redirect می‌شود و برنمی‌گردد
      if (r) setMsg(a.invalidCode);
    });

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (step === 'email') send(); else verify(); }} className="grid gap-4">
      {step === 'email' ? (
        <label className="grid gap-1 text-sm">
          {a.email}
          <input type="email" dir="ltr" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@example.com" />
        </label>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">{a.sent} <b dir="ltr" className="text-[var(--ink)]">{email}</b></p>
          {demo && <p className="rounded-xl bg-[var(--avail)] px-4 py-2 text-sm">{a.demo} <b dir="ltr" className="tracking-widest">{demo}</b></p>}
          <label className="grid gap-1 text-sm">
            {a.code}
            <input
              dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${input} text-center text-2xl tracking-[0.5em]`}
            />
          </label>
        </>
      )}

      {msg && <p role="alert" className="text-sm text-[var(--accent)]">{msg}</p>}

      <button disabled={pending} className={`${cta} disabled:opacity-60`}>
        <span>{step === 'email' ? a.send : a.verify}</span><Chevron className="ltr:rotate-180" />
      </button>

      {step === 'code' && (
        <div className="flex justify-between text-sm text-[var(--muted)]">
          <button type="button" onClick={() => { setStep('email'); setMsg(''); }} className="hover:text-[var(--ink)]">{a.change}</button>
          <button type="button" disabled={pending} onClick={send} className="hover:text-[var(--ink)]">{a.resend}</button>
        </div>
      )}
    </form>
  );
}

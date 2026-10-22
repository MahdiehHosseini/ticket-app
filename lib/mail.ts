// ارسال ایمیل با Resend (فقط fetch، بدون SDK). بدون RESEND_API_KEY در dev کد در کنسول چاپ می‌شود.
export async function sendCode(to: string, code: string): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== 'production') process.stdout.write(`[OTP] ${to}: ${code}\n`);
    return { delivered: false };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? 'Front Row <onboarding@resend.dev>',
      to,
      subject: `${code} — کد ورود به ردیف اول`,
      text: `کد ورود شما: ${code}\nاین کد ۱۰ دقیقه اعتبار دارد. اگر شما درخواست نکرده‌اید، این ایمیل را نادیده بگیرید.\n\nYour sign-in code: ${code} (valid for 10 minutes).`,
      html: `<div dir="rtl" style="font-family:system-ui,sans-serif;text-align:center;padding:24px">
        <p>کد ورود به <b>ردیف اول</b></p>
        <p style="font-size:34px;font-weight:800;letter-spacing:8px;margin:16px 0" dir="ltr">${code}</p>
        <p style="color:#777;font-size:13px">این کد ۱۰ دقیقه اعتبار دارد. اگر شما درخواست نکرده‌اید، نادیده بگیرید.<br/>Valid for 10 minutes.</p></div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`mail ${res.status}`);
  return { delivered: true };
}

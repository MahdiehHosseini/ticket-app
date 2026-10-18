// کلاینت درگاه زرین‌پال (API نسخه‌ی ۴). پیش‌فرض sandbox است؛ برای محیط واقعی ZARINPAL_SANDBOX=false بگذار.
const BASE =
  process.env.ZARINPAL_SANDBOX === 'false'
    ? 'https://payment.zarinpal.com'
    : 'https://sandbox.zarinpal.com'

export const gatewayEnabled = () => Boolean(process.env.ZARINPAL_MERCHANT_ID)

async function call(path: 'request' | 'verify', body: object) {
  const res = await fetch(`${BASE}/pg/v4/payment/${path}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ merchant_id: process.env.ZARINPAL_MERCHANT_ID, ...body }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  const json = (await res.json()) as { data?: Record<string, unknown> | []; errors?: unknown }
  return (Array.isArray(json.data) ? {} : (json.data ?? {})) as Record<string, unknown>
}

// قیمت‌ها در پروژه تومان‌اند؛ زرین‌پال به‌طور پیش‌فرض ریال می‌گیرد، پس ×۱۰
export async function requestPayment(
  amountToman: number,
  callbackUrl: string,
  description: string,
) {
  const d = await call('request', {
    amount: amountToman * 10,
    callback_url: callbackUrl,
    description,
  })
  return d.code === 100
    ? { authority: String(d.authority), url: `${BASE}/pg/StartPay/${d.authority}` }
    : null
}

// کد ۱۰۰ = تایید موفق، ۱۰۱ = قبلاً تایید شده
export async function verifyPayment(amountToman: number, authority: string) {
  const d = await call('verify', { amount: amountToman * 10, authority })
  return d.code === 100 || d.code === 101 ? { refId: String(d.ref_id) } : null
}

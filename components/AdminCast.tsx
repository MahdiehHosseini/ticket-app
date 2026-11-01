import { addCast, deleteCast } from '@/app/admin/actions'
import { getCast } from '@/lib/cast'
import { pick, type Locale } from '@/lib/i18n'
import { cta } from './Icons'

const A = {
  fa: { title: 'بازیگران و عوامل', add: '+ بازیگر جدید', save: 'ذخیره', del: 'حذف', nameFa: 'نام فارسی', nameEn: 'نام انگلیسی',
    roleFa: 'نقش/سمت فارسی', roleEn: 'نقش/سمت انگلیسی', photo: 'عکس (مسیر یا آدرس، اختیاری)', pos: 'ترتیب', empty: 'هنوز کسی ثبت نشده.' },
  en: { title: 'Cast & crew', add: '+ New member', save: 'Save', del: 'Delete', nameFa: 'Name (Persian)', nameEn: 'Name (English)',
    roleFa: 'Role (Persian)', roleEn: 'Role (English)', photo: 'Photo (path or URL, optional)', pos: 'Order', empty: 'Nobody yet.' },
} as const

const input = 'w-full rounded-xl bg-[var(--avail)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'
const sum = 'cursor-pointer select-none rounded-full bg-[var(--avail)] px-4 py-2 text-sm font-bold hover:bg-[var(--line)]'
const del = 'rounded-full bg-[var(--avail)] px-3 py-1 text-xs font-bold text-[var(--accent)] hover:bg-[var(--line)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-xs text-[var(--muted)]">{label}{children}</label>
}

export default async function AdminCast({ eventId, locale }: { eventId: string; locale: Locale }) {
  const a = A[locale]
  const cast = await getCast(eventId)
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-bold">{a.title}</h3>
      <ul className="divide-y divide-[var(--line)] text-sm">
        {cast.length === 0 && <li className="py-2 text-[var(--muted)]">{a.empty}</li>}
        {cast.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <span>{pick(c.name, locale)}{c.role ? <span className="text-[var(--muted)]"> • {pick(c.role, locale)}</span> : null}</span>
            <form action={deleteCast.bind(null, c.id)}><button className={del}>{a.del}</button></form>
          </li>
        ))}
      </ul>
      <details className="mt-3">
        <summary className={`${sum} w-fit`}>{a.add}</summary>
        <form action={addCast} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="eventId" value={eventId} />
          <Field label={a.nameFa}><input name="nameFa" dir="auto" required maxLength={80} className={input} /></Field>
          <Field label={a.nameEn}><input name="nameEn" dir="ltr" required maxLength={80} className={input} /></Field>
          <Field label={a.pos}><input name="position" type="number" min={0} max={999} defaultValue={cast.length + 1} className={input} /></Field>
          <Field label={a.roleFa}><input name="roleFa" dir="auto" maxLength={80} className={input} /></Field>
          <Field label={a.roleEn}><input name="roleEn" dir="ltr" maxLength={80} className={input} /></Field>
          <Field label={a.photo}><input name="photo" dir="ltr" placeholder="/cast/name.jpg" className={input} /></Field>
          <button className={`${cta} sm:col-span-2 lg:col-span-3 lg:mx-auto lg:max-w-xs`}><span>{a.save}</span></button>
        </form>
      </details>
    </div>
  )
}

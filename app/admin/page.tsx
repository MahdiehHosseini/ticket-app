import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import AppBar from '@/components/AppBar'
import { cta } from '@/components/Icons'
import LoginGate from '@/components/LoginGate'
import Skeleton from '@/components/Skeleton'
import { cols, rows } from '@/lib/data'
import { isAdmin } from '@/lib/admin'
import { digits, fmt, pick } from '@/lib/i18n'
import { getPrefs } from '@/lib/prefs'
import { getEvents, getSalesByShow, getShows } from '@/lib/queries'
import { getUserId } from '@/lib/user'
import { createEvent, createShow, deleteEvent, deleteShow } from './actions'

const A = {
  fa: {
    title: 'پنل ادمین',
    login: 'برای ورود به پنل ادمین وارد شو.',
    newEvent: '+ رویداد جدید',
    newShow: '+ سانس جدید',
    save: 'ذخیره',
    slug: 'شناسه‌ی URL (اختیاری)',
    titleFa: 'عنوان فارسی',
    titleEn: 'عنوان انگلیسی',
    genreFa: 'ژانر فارسی',
    genreEn: 'ژانر انگلیسی',
    blurbFa: 'توضیح فارسی',
    blurbEn: 'توضیح انگلیسی',
    duration: 'مدت (دقیقه)',
    rating: 'امتیاز از ۱۰',
    c1: 'رنگ ۱',
    c2: 'رنگ ۲',
    date: 'تاریخ',
    time: 'ساعت (وقت تهران)',
    hall: 'سالن',
    price: 'قیمت پایه (تومان)',
    del: 'حذف',
    locked: 'فروش واقعی دارد',
    sold: 'فروخته',
    empty: 'هنوز رویدادی نیست.',
    noShows: 'بدون سانس',
    min: 'دقیقه',
    poster: 'پوستر (مسیر یا آدرس، اختیاری)'
  },
  en: {
    title: 'Admin panel',
    login: 'Sign in to open the admin panel.',
    newEvent: '+ New event',
    newShow: '+ New showtime',
    save: 'Save',
    slug: 'URL slug (optional)',
    titleFa: 'Title (Persian)',
    titleEn: 'Title (English)',
    genreFa: 'Genre (Persian)',
    genreEn: 'Genre (English)',
    blurbFa: 'Blurb (Persian)',
    blurbEn: 'Blurb (English)',
    duration: 'Duration (min)',
    rating: 'Rating /10',
    c1: 'Color 1',
    c2: 'Color 2',
    date: 'Date',
    time: 'Time (Tehran)',
    hall: 'Hall',
    price: 'Base price (Toman)',
    del: 'Delete',
    locked: 'Has real sales',
    sold: 'sold',
    empty: 'No events yet.',
    noShows: 'No showtimes',
    min: 'min',
    poster: 'Poster (path or URL, optional)'
  },
} as const

const input =
  'w-full rounded-xl bg-[var(--avail)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--accent)]'
const card = 'rounded-3xl bg-[var(--card)] p-5 lg:p-6'
const sum =
  'cursor-pointer select-none rounded-full bg-[var(--avail)] px-4 py-2 text-sm font-bold hover:bg-[var(--line)]'
const del =
  'rounded-full bg-[var(--avail)] px-3 py-1 text-xs font-bold text-[var(--accent)] hover:bg-[var(--line)] disabled:cursor-not-allowed disabled:text-[var(--muted)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs text-[var(--muted)]">
      {label}
      {children}
    </label>
  )
}

export const metadata = { robots: { index: false, follow: false } }

async function Content() {
  const { locale } = await getPrefs()
  const a = A[locale]
  const f = fmt(locale)
  const head = (
    <div className="lg:hidden">
      <AppBar />
    </div>
  )

  if (!(await getUserId()))
    return (
      <div className="flex flex-1 flex-col">
        {head}
        <LoginGate locale={locale} redirectTo="/admin" message={a.login} />
      </div>
    )
  if (!(await isAdmin())) notFound()

  const [evs, sales] = await Promise.all([getEvents(), getSalesByShow()])
  const showLists = await Promise.all(evs.map((e) => getShows(e.id)))
  const capacity = rows.length * cols

  return (
    <div className="flex-1 pb-12">
      {head}
      <div className="mt-8 flex flex-col gap-5 px-5 lg:px-8">
        <h1 className="text-2xl font-extrabold lg:text-3xl">{a.title}</h1>

        <details className={card}>
          <summary className={`${sum} w-fit`}>{a.newEvent}</summary>
          <form action={createEvent} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={a.titleFa}>
              <input name="titleFa" dir="auto" required className={input} />
            </Field>
            <Field label={a.titleEn}>
              <input name="titleEn" dir="ltr" required className={input} />
            </Field>
            <Field label={a.slug}>
              <input name="id" dir="ltr" pattern="[a-z0-9-]*" className={input} />
            </Field>
            <Field label={a.genreFa}>
              <input name="genreFa" dir="auto" required className={input} />
            </Field>
            <Field label={a.genreEn}>
              <input name="genreEn" dir="ltr" required className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={a.duration}>
                <input name="duration" type="number" min={1} max={599} required className={input} />
              </Field>
              <Field label={a.rating}>
                <input
                  name="rating"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  required
                  className={input}
                />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Field label={a.blurbFa}>
                <textarea name="blurbFa" dir="auto" rows={3} required className={input} />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Field label={a.blurbEn}>
                <textarea name="blurbEn" dir="ltr" rows={3} required className={input} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label={a.c1}>
                <input
                  name="colorFrom"
                  type="color"
                  defaultValue="#1b2a6b"
                  className="h-10 w-full rounded-xl"
                />
              </Field>
              <Field label={a.c2}>
                <input
                  name="colorTo"
                  type="color"
                  defaultValue="#6f8be0"
                  className="h-10 w-full rounded-xl"
                />
              </Field>
            </div>
            <button className={`${cta} sm:col-span-2 lg:col-span-3 lg:mx-auto lg:max-w-xs`}>
              <span>{a.save}</span>
            </button>
          </form>
        </details>

        {evs.length === 0 && <p className="text-[var(--muted)]">{a.empty}</p>}

        {evs.map((e, i) => {
          const list = showLists[i]
          const locked = list.some((s) => (sales[s.id]?.real ?? 0) > 0)
          return (
            <section key={e.id} className={card}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold">{pick(e.title, locale)}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {pick(e.genre, locale)} • {f(e.duration)} {a.min} • {digits(e.rating, locale)}
                  </p>
                </div>
                <form action={deleteEvent.bind(null, e.id)}>
                  <button className={del} disabled={locked} title={locked ? a.locked : undefined}>
                    {a.del}
                  </button>
                </form>
              </div>

              <ul className="mt-4 divide-y divide-[var(--line)] text-sm">
                {list.length === 0 && <li className="py-2 text-[var(--muted)]">{a.noShows}</li>}
                {list.map((s) => {
                  const sl = sales[s.id]
                  return (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2"
                    >
                      <span>
                        {pick(s.day, locale)} • {digits(s.time, locale)} • {pick(s.hall, locale)}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-[var(--muted)]">{f(s.price)}</span>
                        <span className="text-[var(--muted)]">
                          {f(sl?.paid ?? 0)}/{f(capacity)} {a.sold}
                        </span>
                        <form action={deleteShow.bind(null, s.id)}>
                          <button
                            className={del}
                            disabled={(sl?.real ?? 0) > 0}
                            title={(sl?.real ?? 0) > 0 ? a.locked : undefined}
                          >
                            {a.del}
                          </button>
                        </form>
                      </span>
                    </li>
                  )
                })}
              </ul>

              <details className="mt-4">
                <summary className={`${sum} w-fit`}>{a.newShow}</summary>
                <form action={createShow} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <input type="hidden" name="eventId" value={e.id} />
                  <Field label={a.date}>
                    <input name="date" type="date" required className={input} />
                  </Field>
                  <Field label={a.time}>
                    <input name="time" type="time" required className={input} />
                  </Field>
                  <Field label={a.hall}>
                    <select name="hall" className={input}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </Field>
                  <Field label={a.price}>
                    <input
                      name="price"
                      type="number"
                      min={1000}
                      step={1000}
                      defaultValue={200000}
                      required
                      className={input}
                    />
                  </Field>
                  <Field label={a.poster}>
                    <input name="poster" dir="ltr" placeholder="/posters/my-film.jpg" className={input} />
                  </Field>
                  <button className={`${cta} sm:col-span-2 lg:col-span-4 lg:mx-auto lg:max-w-xs`}>
                    <span>{a.save}</span>
                  </button>
                </form>
              </details>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default function Admin() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content />
    </Suspense>
  )
}

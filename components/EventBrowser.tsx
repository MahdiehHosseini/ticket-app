'use client'
import { useMemo, useState } from 'react'
import type { Event } from '@/lib/data'
import { dict, pick, type Locale } from '@/lib/i18n'
import EventCard from './EventCard'
import { Search } from './Icons'

// جستجو و فیلتر ژانر سمت کلاینت (فهرست فیلم‌ها کوچک است)
export default function EventBrowser({
  events,
  prices,
  locale,
}: {
  events: Event[]
  prices: Record<string, number>
  locale: Locale
}) {
  const t = dict[locale]
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')
  const genres = useMemo(
    () => [...new Set(events.map((e) => pick(e.genre, locale)))],
    [events, locale],
  )
  const needle = q.trim().toLowerCase()
  const list = events.filter(
    (e) =>
      (!genre || pick(e.genre, locale) === genre) &&
      `${e.title.fa} ${e.title.en}`.toLowerCase().includes(needle),
  )
  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${on ? 'cta-grad' : 'bg-[var(--avail)] hover:bg-[var(--line)]'}`

  return (
    <>
      <div className="px-5 lg:px-8">
        <label className="glass-field flex max-w-xl items-center gap-3 px-5 py-3 text-[var(--muted)]">
          <Search />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="w-full bg-transparent text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </label>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 lg:px-8">
        <button className={chip(genre === '')} onClick={() => setGenre('')}>
          {t.allGenres}
        </button>
        {genres.map((g) => (
          <button key={g} className={chip(genre === g)} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 px-5 text-center text-[var(--muted)]">{t.noResults}</p>
      ) : (
        <div
          key={`${q}|${genre}`}
          className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-2 pb-8 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 lg:gap-7 lg:px-8"
        >
          {list.map((e, i) => (
            <div
              key={e.id}
              className="snap-card rise w-[66%] shrink-0 snap-start md:w-auto"
              style={{ '--i': i } as React.CSSProperties}
            >
              <EventCard event={e} locale={locale} price={prices[e.id]} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

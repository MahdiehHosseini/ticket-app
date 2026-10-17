// جایگزین موقت تا وقتی داده‌ی صفحه (کوکی، پارامتر، دیتابیس) آماده می‌شود
export default function Skeleton() {
  return (
    <div className="flex-1 animate-pulse space-y-4 px-5 pt-8 lg:px-8" aria-hidden>
      <div className="h-6 w-1/3 rounded-lg bg-[var(--avail)]" />
      <div className="aspect-[3/4] w-3/5 rounded-3xl bg-[var(--avail)] lg:aspect-[16/6] lg:w-full" />
      <div className="h-4 w-1/2 rounded bg-[var(--avail)]" />
    </div>
  )
}

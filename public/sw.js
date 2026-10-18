// سرویس‌ورکر حداقلی: صفحه‌ها را «کش نمی‌کند» (محتوا به کاربر/زبان/تم وابسته است و رزرو بدون اینترنت معنی ندارد)،
// فقط وقتی اینترنت نیست صفحه‌ی آفلاین را نشان می‌دهد.
const CACHE = 'frontrow-v1'
const OFFLINE = '/offline.html'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([OFFLINE, '/icons/icon-192.png']))
      .then(() => self.skipWaiting()),
  )
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate')
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)))
})

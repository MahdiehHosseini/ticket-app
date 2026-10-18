import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ردیف اول | Front Row',
    short_name: 'ردیف اول',
    description: 'رزرو بلیت سینما با انتخاب صندلی روی نقشه‌ی سالن',
    start_url: '/',
    display: 'standalone',
    background_color: '#eceffb',
    theme_color: '#f4155a',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

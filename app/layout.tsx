import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Vazirmatn } from 'next/font/google'
import AppBar from '@/components/AppBar'
import RegisterSW from '@/components/RegisterSW'
import './globals.css'
import NextTopLoader from 'nextjs-toploader'

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: { default: 'ردیف اول | Front Row', template: '%s | ردیف اول' },
  description: 'رزرو بلیت سینما با انتخاب صندلی روی نقشه‌ی سالن. Seat-map cinema ticket booking.',
  openGraph: {
    siteName: 'Front Row',
    locale: 'fa_IR',
    type: 'website',
    images: ['/icons/icon-512.png'],
  },
  appleWebApp: { capable: true, title: 'Front Row', statusBarStyle: 'default' },
}

export const viewport: Viewport = { themeColor: '#f4155a' }

// قبل از اولین رندر، زبان/جهت/تم رو از کوکی می‌خونه تا صفحه نپره
const init = `(function(){try{var c=document.cookie,l=/(?:^|; )locale=en/.test(c)?'en':'fa',d=document.documentElement;d.lang=l;d.dir=l==='fa'?'rtl':'ltr';d.dataset.theme=/(?:^|; )theme=light/.test(c)?'light':'dark'}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazir.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body>
        {/* موبایل: تمام‌عرض با زمینه‌ی سفید. دسکتاپ: عرض ۱۱۵۲ با کارت‌های جدا روی زمینه‌ی لوندر */}
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-transparent">
          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-[72px]" />}>
              <AppBar />
            </Suspense>
          </div>
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </body>
      <NextTopLoader color="#ff3d77" height={3} showSpinner={false} shadow="0 0 12px #ff3d77" />
      <RegisterSW />
    </html>
  )
}

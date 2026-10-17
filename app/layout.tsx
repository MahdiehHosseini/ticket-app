import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Vazirmatn } from 'next/font/google'
import AppBar from '@/components/AppBar'
import './globals.css'

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
})

export const metadata: Metadata = {
  title: 'ردیف اول | Front Row',
  description: 'Seat-map ticket booking',
}

// قبل از اولین رندر، زبان/جهت/تم رو از کوکی می‌خونه تا صفحه نپره
const init = `(function(){try{var c=document.cookie,l=/(?:^|; )locale=en/.test(c)?'en':'fa',d=document.documentElement;d.lang=l;d.dir=l==='fa'?'rtl':'ltr';d.dataset.theme=/(?:^|; )theme=dark/.test(c)?'dark':'light'}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazir.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body>
        {/* موبایل: تمام‌عرض با زمینه‌ی سفید. دسکتاپ: عرض ۱۱۵۲ با کارت‌های جدا روی زمینه‌ی لوندر */}
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col bg-[var(--card)] lg:bg-transparent">
          <div className="hidden lg:block">
            <Suspense fallback={<div className="h-[72px]" />}>
              <AppBar />
            </Suspense>
          </div>
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </body>
    </html>
  )
}

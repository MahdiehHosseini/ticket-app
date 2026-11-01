// متن‌ها و تایپ‌های مشترک بخش نظرات (بدون وابستگی به سرور، قابل استفاده در کلاینت)
export type ReviewState = { ok?: boolean; error?: 'auth' | 'access' | 'stars' | 'long' } | null

export const R = {
  fa: {
    title: 'امتیاز و نظرات', count: '{n} نظر', none: 'هنوز نظری ثبت نشده. اولین نفر باش!',
    rate: 'امتیاز شما', yourReview: 'نظر شما', comment: 'نظرت درباره‌ی فیلم (اختیاری)',
    send: 'ثبت نظر', update: 'ویرایش نظر', del: 'حذف نظر', saved: 'نظر شما ثبت شد.',
    errStars: 'امتیاز را انتخاب کن.', errLong: 'نظر خیلی طولانی است (حداکثر ۱۰۰۰ کاراکتر).',
    errAccess: 'فقط کسانی که این فیلم را دیده‌اند می‌توانند نظر بدهند.', errAuth: 'ابتدا وارد شو.',
    needLogin: 'برای ثبت نظر وارد شو.', login: 'ورود',
    onlyViewers: 'بعد از تماشای فیلم (خرید بلیت و پایان سانس) می‌توانی امتیاز بدهی و نظر بنویسی.',
    user: 'کاربر', verified: 'تماشاگر تأییدشده',
    note: 'امتیاز کل از ترکیب امتیاز اولیه‌ی فیلم و نظر تماشاگران محاسبه می‌شود.',
  },
  en: {
    title: 'Ratings & reviews', count: '{n} reviews', none: 'No reviews yet. Be the first!',
    rate: 'Your rating', yourReview: 'Your review', comment: 'What did you think? (optional)',
    send: 'Post review', update: 'Update review', del: 'Delete review', saved: 'Your review was saved.',
    errStars: 'Pick a rating.', errLong: 'Review is too long (max 1000 characters).',
    errAccess: 'Only people who watched this film can review it.', errAuth: 'Please sign in first.',
    needLogin: 'Sign in to leave a review.', login: 'Sign in',
    onlyViewers: 'After you watch the film (bought a ticket and the showtime has ended) you can rate it and write a review.',
    user: 'User', verified: 'Verified viewer',
    note: "The overall score blends the film's starting rating with viewers' reviews.",
  },
} as const

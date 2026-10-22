import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: text('id').primaryKey(), // slug
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en').notNull(),
  genreFa: text('genre_fa').notNull(),
  genreEn: text('genre_en').notNull(),
  blurbFa: text('blurb_fa').notNull(),
  blurbEn: text('blurb_en').notNull(),
  durationMin: integer('duration_min').notNull(),
  rating: text('rating').notNull(),
  colorFrom: text('color_from').notNull(),
  colorTo: text('color_to').notNull(),
});

export const shows = pgTable(
  'shows',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    hallFa: text('hall_fa').notNull(),
    hallEn: text('hall_en').notNull(),
    price: integer('price').notNull(), // تومان
  },
  (t) => [index('shows_event_idx').on(t.eventId)],
);

// هر ردیف = یک صندلی نگه‌داشته‌شده (held) یا خریداری‌شده (paid)
export const reservations = pgTable(
  'reservations',
  {
    id: serial('id').primaryKey(),
    showId: text('show_id').notNull().references(() => shows.id, { onDelete: 'cascade' }),
    seat: text('seat').notNull(), // مثل D5
    status: text('status', { enum: ['held', 'paid'] }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }), // فقط برای held
    userId: text('user_id'), // در مرحله‌ی احراز هویت وصل می‌شود
    orderId: text('order_id'), // شناسه‌ی سفارش بعد از پرداخت (محتوای QR بلیت)
    holdToken: text('hold_token'), // شناسه‌ی مرورگری که صندلی را نگه داشته (کوکی hold)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // جلوی رزرو دوبل یک صندلی در یک سانس را در سطح دیتابیس می‌گیرد
  (t) => [uniqueIndex('reservations_show_seat_uq').on(t.showId, t.seat)],
);

// هر ردیف = یک تلاش پرداخت در درگاه. authority شناسه‌ی تراکنش درگاه است و callback با آن پیدا می‌شود.
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  authority: text('authority').notNull().unique(),
  showId: text('show_id').notNull().references(() => shows.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  holdToken: text('hold_token').notNull(),
  seats: text('seats').notNull(), // با ویرگول جدا شده
  amount: integer('amount').notNull(), // تومان، محاسبه‌شده سمت سرور
  status: text('status', { enum: ['pending', 'verifying', 'paid', 'failed'] }).notNull().default('pending'),
  refId: text('ref_id'), // شماره‌ی پیگیری درگاه
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// کدهای یک‌بارمصرف ورود با ایمیل. فقط hash ذخیره می‌شود، نه خود کد.
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    ip: text('ip').notNull(),
    codeHash: text('code_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('otp_email_idx').on(t.email)],
);

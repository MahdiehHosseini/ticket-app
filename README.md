# Front Row — Seat-Map Ticket Booking

A full-stack cinema ticket booking app built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL** and **Drizzle ORM**.
Pick a film, choose a showtime, select seats on an interactive hall map, pay through a real payment gateway (Zarinpal sandbox) and get a ticket with a QR code.

Bilingual (Persian RTL / English LTR), light and dark themes, responsive from phone to desktop.

> Live demo: _add your Netlify URL_ · Screenshots: _add 3–4 images here_

## Features

- Interactive seat map with live availability, premium rows and a 6-seat limit
- **Temporary seat holds (10 min)** with a countdown, so two people can never buy the same seat
- Real payment flow: Zarinpal request → redirect → callback → **server-side verify** → ticket issued
- GitHub sign-in (Auth.js), "My tickets" page with QR codes
- Admin panel: create events and showtimes, see sales per showtime
- Persian / English UI with correct RTL/LTR layout, light/dark theme without a flash on load

## Tech stack

Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript · Tailwind CSS · PostgreSQL (Neon/Supabase) · Drizzle ORM · Auth.js (next-auth v5) · Zarinpal API v4 · `qrcode`

## Interesting engineering decisions

**Seat holds are enforced by the database, not by application code.**
`reservations` has a unique index on `(show_id, seat)`. Holding seats is one transaction that (1) deletes expired holds and the caller's previous hold, (2) inserts the requested seats with `ON CONFLICT DO NOTHING`, and (3) rolls back if fewer rows were inserted than requested — all-or-nothing. Concurrent requests for the same seat can only produce one winner. Seats are inserted in sorted order so two overlapping requests can't deadlock.

**Prices and seats never come from the client.**
After a hold, the checkout page and the payment amount are computed on the server from the seats stored in the database, so tampering with the URL can't change what is charged.

**Payments are verified server-to-server.**
A ticket is issued only after the gateway's `verify` call succeeds, not because the redirect said `Status=OK`. The callback claims each transaction once (`pending → verifying`), so refreshing it can't issue tickets twice. Before verifying, it checks the hold is still intact; if not, it skips verification and the gateway refunds the unverified payment.

**No anonymous-user accounts needed for holds.**
Before sign-in, holds are tied to an HttpOnly cookie token; the token is attached to the user when they pay.

**Rendering model.**
Pages use per-page `<Suspense>` boundaries with skeletons (Next 16 `cacheComponents`). Language and theme live in cookies and are applied by a tiny inline script before first paint.

## Getting started

```bash
npm install
cp .env.example .env     # fill in the values (see below)
npm run db:push          # create tables
npm run db:seed          # demo films, showtimes and some taken seats
npm run dev
```

### Environment variables

| Variable                               | Purpose                                                           |
| -------------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`                         | Postgres connection string                                        |
| `AUTH_SECRET`                          | Generate with `npx auth secret`                                   |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | GitHub OAuth app (callback: `<site>/api/auth/callback/github`)    |
| `ADMIN_LOGINS`                         | Comma-separated GitHub usernames allowed into `/admin`            |
| `ZARINPAL_MERCHANT_ID`                 | Optional. Leave empty to use the built-in fake payment (dev only) |
| `ZARINPAL_SANDBOX`                     | `true` (default) or `false` for production                        |
| `APP_URL`                              | Public site URL, used for the payment callback                    |

### Scripts

`npm run dev` · `npm run build` · `npm run db:push` (apply schema) · `npm run db:seed` (reset demo data)

## Project structure

```
app/            routes: home, events/[id], book/[showId], checkout, tickets, admin, api/*
components/     SeatMap, Poster, Countdown, AppBar, LoginGate, ...
db/             Drizzle schema, client, seed
lib/            queries, booking core, Zarinpal client, i18n, helpers
auth.ts         Auth.js config
```

## Deployment (Netlify)

1. Push to GitHub and import the repo in Netlify.
2. Add all environment variables above (set `APP_URL` and `AUTH_URL` to the site URL).
3. Add the production callback URL to your GitHub OAuth app.
4. Run `npm run db:push` and `npm run db:seed` once against the production database (or create data from `/admin`).

## Known limitations / next steps

- No automatic reconciliation for payments whose verification fails because of a network error
- Fake payment is used when no merchant ID is set — never leave it that way on a public site that sells real tickets
- Seat availability on the map is not pushed live (refreshes on navigation); Supabase Realtime/Pusher would add that
- No rate limiting on the hold endpoint
- Poster images are generated gradients; real posters can replace `components/Poster.tsx`

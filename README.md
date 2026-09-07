# Business Assistant

Telegram Mini App for appointment-based businesses: calendar, clients, reminders, and messaging.

The first screen is **Today**. The product is built to feel like a business assistant inside Telegram, not a generic SaaS dashboard.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No Supabase, Telegram bot, or SMS credentials are required.

Demo data is stored in the browser. Reset it from **More → Developer**.

## Telegram Mini App

Production Mini App URL: [https://www.mrrbest.uz/](https://www.mrrbest.uz/)

1. Create a bot with [@BotFather](https://t.me/BotFather).
2. Set the Menu Button / Mini App URL to `https://www.mrrbest.uz/`.
3. Add `TELEGRAM_BOT_TOKEN` on the server only.
4. Set `NEXT_PUBLIC_APP_URL=https://www.mrrbest.uz`.
5. Optional webhook: `https://www.mrrbest.uz/api/telegram/webhook`.

Local browser development uses a mock Telegram user (`NEXT_PUBLIC_DEV_USER_ID`).

## Environment

See `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TELEGRAM_BOT_TOKEN
SMS_PROVIDER
SMS_API_KEY
```

Leave these empty to stay in mock mode.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase PostgreSQL + RLS (migrations in `supabase/migrations`)
- Mock data layer in `lib/mock`
- Notification providers in `lib/notifications` (SMS, Telegram, mock)

SMS sending uses `MockSmsProvider` and returns `{ success: true, status: "queued" }`. Messages are stored with status history.

## Architecture

UI components call `lib/services/*`. Those services talk to the mock store today and can later target Supabase without changing screens.

Every business-owned table uses `business_id` and Row Level Security so one business cannot read another business's clients, appointments, or messages.

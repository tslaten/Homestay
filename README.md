# Homestay — guest guide

A touch-only guest guide for an Amazon Echo Show 11 (Silk browser), viewed from 1–2 m.

Next.js (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui · Upstash Redis · Vercel.

## Develop

```bash
npm install
npm run dev          # uses an in-memory store with sample data if no Redis env vars are set
```

To use Upstash locally, run `vercel env pull .env.local` (or copy `.env.example` and fill it in).

An empty database is filled with sample data automatically on first use. To reset the
settings and sample docs later:

```bash
npm run db:seed -- --force
```

## Deploy

Vercel builds `main`. Production needs the Upstash for Redis integration connected
(`KV_REST_API_URL` / `KV_REST_API_TOKEN`); the build fails without it.

## Theme

Paste your shadcn theme into `app/globals.css` between the `BEGIN SHADCN THEME` / `END SHADCN THEME` markers.

## Time

All date/time logic is pinned to `America/New_York` in `lib/time.ts`. Don't use `Date#getHours()` and friends anywhere else.

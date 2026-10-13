# Homestay — guest guide

A touch-only guest guide for an Amazon Echo Show 11 (Silk browser), viewed from 1–2 m.

Next.js (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui · Upstash Redis · Vercel.

## Develop

```bash
npm install
npm run dev          # uses an in-memory store with sample data if no Redis env vars are set
```

To use Upstash, copy `.env.example` to `.env.local`, fill in the credentials, then:

```bash
npm run db:seed              # write sample data once
npm run db:seed -- --force   # overwrite settings + sample docs
```

## Theme

Paste your shadcn theme into `app/globals.css` between the `BEGIN SHADCN THEME` / `END SHADCN THEME` markers.

## Time

All date/time logic is pinned to `America/New_York` in `lib/time.ts`. Don't use `Date#getHours()` and friends anywhere else.

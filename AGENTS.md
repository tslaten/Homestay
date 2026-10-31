<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Workflow

- `main` is the production branch: every push to it deploys to Vercel production.
- Never push directly to `main`. Put new work on a branch and open a pull request,
  so the Vercel preview deployment can be checked before merging.
- Before pushing, run `npm run lint`, `npm run typecheck` and `npm run build`.
- All date/time logic goes through `lib/time.ts` (America/New_York).
- Guest pages live in `app/(kiosk)`, admin in `app/(admin)/admin`. Every guest page's data
  component and guest Server Action calls `requireGuest()`; every admin page and admin Server
  Action calls `requireAdmin()` (lib/auth/access.ts). Access is currently open to anyone with
  the URL by the owner's choice; keep calling the hooks so checks can be added in one place.

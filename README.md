# Kobi E-commerce

Modern e-commerce app:

- **Web**: React + TypeScript + Tailwind + animations
- **API**: Express + TypeScript + Prisma + Postgres + Stripe Checkout

## Prereqs

- Node.js (>= 20)
- `pnpm`
- Postgres database (Docker Compose file included)
- Stripe account (test mode is fine)

## Setup

1) Install dependencies

```bash
pnpm install
```

2) Start Postgres (optional but recommended)

```bash
docker compose up -d
```

3) Configure env

- Copy `[apps/api/.env.example](apps/api/.env.example)` to `apps/api/.env`
- Copy `[apps/web/.env.example](apps/web/.env.example)` to `apps/web/.env`

4) Prisma

```bash
pnpm -C apps/api prisma:generate
pnpm -C apps/api prisma:migrate
pnpm -C apps/api seed
```

5) Run dev

```bash
pnpm dev
```

## Stripe webhook (local)

Use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to http://localhost:4000/webhooks/stripe
```

Then set `STRIPE_WEBHOOK_SECRET` from the CLI output into `apps/api/.env`.

## Deployment (Vercel — web app)

In the Vercel project, set **Root Directory** to the **repository root** (leave blank / `.`). Do **not** set it to `apps/web`, or installs won’t see the pnpm workspace and the build will fail.

[`vercel.json`](vercel.json) runs `pnpm install` at the root, then `pnpm run build:web` (Vite + `tsc`; `@kobi/shared` resolves from source via path aliases—no separate shared build step). **Output Directory** is `apps/web/dist`.

Set **`VITE_API_URL`** in the Vercel project to your public API origin (e.g. `https://your-api.up.railway.app`). Redeploy after changing it.

If the SPA 404s on refresh for routes like `/products`, add a rewrite to `index.html` in the Vercel project or extend `vercel.json` with SPA rewrites.

## Deployment (Railway API)

The database is only reachable **inside Railway’s network at runtime**, not during the **build**. Do **not** run `prisma migrate deploy` in the build step (you will get `P1001` / can’t reach `postgres.railway.internal`).

This repo includes [`railway.json`](railway.json) at the root. **Config in that file overrides** the Build/Start commands in the Railway dashboard—commit and redeploy so deploys stop appending `prisma migrate deploy` to the build.

**Build command** (compile only; no DB):

```bash
pnpm -C packages/shared build && pnpm -C apps/api exec prisma generate && pnpm -C apps/api build
```

**Start command** on Railway (see [`railway.json`](railway.json)): migrations run in **`preDeployCommand`**, then the process uses **`start:server`** (`node dist/index.js` only) so HTTP comes up quickly and healthchecks can pass.

For a **single command** elsewhere (e.g. VPS), use:

```bash
pnpm -C apps/api start
```

That runs `prisma migrate deploy` then `node dist/index.js`. For local debugging without migrations, use `pnpm -C apps/api start:server`.

The API **listens on `0.0.0.0`**, which platforms like Railway require for routing and healthchecks.

If you previously set a custom build in the dashboard, either remove it or rely on `railway.json` after you push.

### Seed products (production database)

The catalog is loaded by [`apps/api/src/seed.ts`](apps/api/src/seed.ts). On Railway, **deploys run the seed automatically** in [`railway.json`](railway.json) right after `prisma migrate deploy` (`seed:prod` runs `node dist/seed.js` inside Railway’s network, where Postgres is reachable). The script is idempotent: existing rows are updated by **name**; missing rows are inserted.

**Why your Railway DB looked empty:** running `pnpm -C apps/api seed` or `pnpm -C apps/api seed:prod` **on your laptop** uses `apps/api/.env` or a `DATABASE_URL` that often points at `postgres.railway.internal`. That hostname **only resolves inside Railway**, so the client never reaches production Postgres (or you were seeding a local Docker DB instead). `railway run` also injects env **locally**, so it has the same limitation unless you use a **public** DB URL.

**Manual seed from your machine (optional):** In the Railway dashboard, open your **Postgres** service → **Connect** / **Variables** and copy a connection string that uses the **TCP proxy (public) host**, or use `DATABASE_PUBLIC_URL` if present. Then:

```bash
pnpm -C packages/shared build && pnpm -C apps/api exec prisma generate && pnpm -C apps/api build
set DATABASE_URL=postgresql://...   # Windows cmd; use `export` on macOS/Linux
pnpm -C apps/api seed:prod
```

Or use the Railway dashboard’s **shell / SSH into the running API service** (if enabled) and run `pnpm -C apps/api seed:prod` from the repo root so the **internal** `DATABASE_URL` works.



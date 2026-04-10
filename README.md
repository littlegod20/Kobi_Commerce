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



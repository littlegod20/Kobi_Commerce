# Smoke test (local)

## 1) Database + seed

```bash
docker compose up -d
pnpm -C apps/api prisma:generate
pnpm -C apps/api prisma:migrate
pnpm -C apps/api seed
```

## 2) Stripe webhook forwarding

In a separate terminal:

```bash
stripe listen --forward-to http://localhost:4000/webhooks/stripe
```

Copy the webhook signing secret into `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`.

## 3) Run the app

```bash
pnpm dev
```

## 4) Checkout flow

1. Open the web app (default: `http://localhost:5173`).
2. Add one or more products to the cart.
3. Go to **Cart** → **Continue to checkout** (Stripe Checkout).
4. Complete a test payment.
5. You should land on `/checkout/success?session_id=...` and see the order flip to **paid** after the webhook arrives (may take a moment).

## 5) Quick API checks

```bash
curl http://localhost:4000/health
curl http://localhost:4000/products
```

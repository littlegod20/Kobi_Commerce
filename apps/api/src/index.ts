import "dotenv/config";

import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { z } from "zod";
import Stripe from "stripe";

import {
  CreateCheckoutSessionRequestSchema,
  CreateCheckoutSessionResponseSchema,
  OrderSchema,
  ProductSchema,
} from "@kobi/shared";

import { getEnv } from "./env";
import { createCors, createHelmet } from "./http";
import { prisma } from "./prisma";

const env = getEnv();
const log = pino({ level: process.env.LOG_LEVEL ?? "info" });
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const app = express();

// Stripe webhooks require the raw request body. Mount webhook route before JSON middleware.
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.header("stripe-signature");
    if (!sig) return res.status(400).json({ error: "Missing Stripe signature" });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Webhook error";
      log.warn({ err }, "stripe webhook signature verification failed");
      return res.status(400).json({ error: msg });
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "paid",
              stripePaymentIntentId: paymentIntentId ?? null,
            },
          });
        } else {
          // Fallback: mark paid by session id if order already exists
          await prisma.order.updateMany({
            where: { stripeSessionId: sessionId },
            data: {
              status: "paid",
              stripePaymentIntentId: paymentIntentId ?? null,
            },
          });
        }
      }

      res.json({ received: true });
    } catch (err) {
      log.error({ err }, "stripe webhook handler failed");
      res.status(500).json({ error: "Webhook handler failed" });
    }
  },
);

app.use(pinoHttp({ logger: log }));
app.use(createHelmet());
app.use(createCors(env.CLIENT_URL));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/products", async (req, res) => {
  const QuerySchema = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
  });
  const { q, category } = QuerySchema.parse(req.query);

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const parsed = products.map((p) =>
    ProductSchema.parse({
      ...p,
      // Prisma returns `images` as string[] already, just ensure shape
      images: p.images ?? [],
    }),
  );

  res.json(parsed);
});

app.get("/products/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(
    ProductSchema.parse({
      ...product,
      images: product.images ?? [],
    }),
  );
});

app.post("/checkout/session", async (req, res) => {
  const { items } = CreateCheckoutSessionRequestSchema.parse(req.body);

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalCents = 0;
  let currency = "USD";

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) return res.status(400).json({ error: "Invalid product" });
    if (item.quantity > product.inventory) {
      return res.status(400).json({ error: "Insufficient inventory" });
    }

    currency = product.currency;
    totalCents += product.priceCents * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: product.description,
          images: product.images ?? undefined,
        },
      },
    });
  }

  // Create order first (pending), store items snapshot.
  const order = await prisma.order.create({
    data: {
      status: "pending",
      totalCents,
      currency,
      stripeSessionId: null,
      items: {
        create: items.map((i) => {
          const p = productById.get(i.productId)!;
          return {
            productId: p.id,
            name: p.name,
            unitPriceCents: p.priceCents,
            quantity: i.quantity,
            lineTotalCents: p.priceCents * i.quantity,
          };
        }),
      },
    },
    include: { items: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/checkout/cancel`,
    metadata: { orderId: order.id },
  });

  // Update order with real session id.
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  const payload = CreateCheckoutSessionResponseSchema.parse({
    checkoutUrl: session.url,
    sessionId: session.id,
  });

  res.json(payload);
});

app.get("/orders/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(
    OrderSchema.parse({
      ...order,
      createdAt: order.createdAt.toISOString(),
      stripeSessionId: order.stripeSessionId ?? "",
      items: order.items,
    }),
  );
});

app.get("/orders/by-session/:sessionId", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { stripeSessionId: req.params.sessionId },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(
    OrderSchema.parse({
      ...order,
      createdAt: order.createdAt.toISOString(),
      stripeSessionId: order.stripeSessionId ?? "",
      items: order.items,
    }),
  );
});

app.listen(env.PORT, () => {
  log.info({ port: env.PORT }, "api listening");
});


import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import type { Order, OrderItem } from "@kobi/shared";

import { getOrderBySessionId } from "../../lib/api";
import { Button } from "../components/Button";

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [order, setOrder] = React.useState<Order | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      setError("Missing session_id in URL.");
      return;
    }

    const resolvedSessionId = sessionId;

    let cancelled = false;
    let attempts = 0;

    async function tick() {
      try {
        const o = await getOrderBySessionId(resolvedSessionId);
        if (cancelled) return;
        setOrder(o);

        if (o.status === "paid" || o.status === "failed") return;

        attempts += 1;
        if (attempts > 40) {
          setError(
            "Still waiting for payment confirmation. If you paid, check webhooks or refresh in a moment.",
          );
          return;
        }

        window.setTimeout(tick, 750);
      } catch (e) {
        if (cancelled) return;
        attempts += 1;
        if (attempts > 40) {
          setError(e instanceof Error ? e.message : "Failed to load order");
          return;
        }
        window.setTimeout(tick, 750);
      }
    }

    void tick();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Payment</h1>
        <p className="text-sm text-zinc-600">
          We’re confirming your order status (webhooks can take a moment).
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!sessionId ? null : !order ? (
        <div className="space-y-3">
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-100" />
          <div className="h-40 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-50" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl border border-zinc-200 bg-white p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Order</div>
              <div className="mt-1 text-xs text-zinc-600">{order.id}</div>
            </div>
            <div
              className={
                order.status === "paid"
                  ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                  : order.status === "failed"
                    ? "inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
                    : "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
              }
            >
              {order.status}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {order.items.map((it: OrderItem) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-zinc-600">
                    Qty {it.quantity} · {formatMoney(it.unitPriceCents, order.currency)} each
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold">
                  {formatMoney(it.lineTotalCents, order.currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-6">
            <div className="text-sm text-zinc-600">Total</div>
            <div className="text-lg font-semibold">
              {formatMoney(order.totalCents, order.currency)}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/products">Continue shopping</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link to="/cart">Back to cart</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function formatMoney(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}


import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { createCheckoutSession, getProduct } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { Button } from "../components/Button";

export function CartPage() {
  const cart = useCart();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [productById, setProductById] = React.useState<
    Record<string, Awaited<ReturnType<typeof getProduct>>>
  >({});
  /** Only mark an id after a successful fetch. Prevents React Strict Mode from leaving the UI stuck on “Loading…”. */
  const fetchedIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set(cart.items.map((i) => i.productId)));
    const missing = ids.filter((id) => !fetchedIdsRef.current.has(id));
    if (missing.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            const p = await getProduct(id);
            return [id, p] as const;
          }),
        );

        if (cancelled) return;

        setProductById((prev) => {
          const next = { ...prev };
          for (const [id, p] of results) {
            next[id] = p;
            fetchedIdsRef.current.add(id);
          }
          return next;
        });
      } catch (e) {
        if (cancelled) return;
        for (const id of missing) fetchedIdsRef.current.delete(id);
        setError(e instanceof Error ? e.message : "Failed to load cart items");
      }
    })();

    return () => {
      cancelled = true;
      // Strict Mode remounts with fresh state but keeps this ref. Clear in-flight ids
      // so the next mount can fetch again instead of staying stuck on “Loading…”.
      for (const id of missing) fetchedIdsRef.current.delete(id);
    };
  }, [cart.items]);

  const subtotalCents = React.useMemo(() => {
    let total = 0;
    for (const item of cart.items) {
      const p = productById[item.productId];
      if (!p) continue;
      total += p.priceCents * item.quantity;
    }
    return total;
  }, [cart.items, productById]);

  const currency = cart.items
    .map((i) => productById[i.productId]?.currency)
    .find(Boolean);

  async function checkout() {
    try {
      setBusy(true);
      setError(null);
      const res = await createCheckoutSession({ items: cart.items });
      window.location.assign(res.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Adjust quantities, then continue to Stripe Checkout.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
          <div className="text-sm font-semibold">Your cart is empty</div>
          <div className="mt-2 text-sm text-zinc-600">
            Add something beautiful from the catalog.
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {cart.items.map((item, idx) => {
              const p = productById[item.productId];
              return (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="flex gap-4 rounded-3xl border border-zinc-200 bg-white p-4"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                    {p?.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p?.name ?? "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse bg-zinc-100" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {p?.name ?? "Loading…"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {p ? formatMoney(p.priceCents, p.currency) : "—"}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-sm hover:bg-zinc-50"
                        onClick={() =>
                          cart.setQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <div className="min-w-[2rem] text-center text-sm font-medium">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-sm hover:bg-zinc-50"
                        onClick={() =>
                          cart.setQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-zinc-600 hover:text-zinc-900"
                        onClick={() => cart.removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold">Summary</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-semibold">
                {currency
                  ? formatMoney(subtotalCents, currency)
                  : "Loading…"}
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <Button
                type="button"
                className="w-full"
                disabled={busy || !currency}
                onClick={() => void checkout()}
              >
                {busy ? "Redirecting…" : "Continue to checkout"}
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/products">Keep shopping</Link>
              </Button>
            </div>

            <div className="mt-6 text-xs leading-relaxed text-zinc-600">
              You’ll be redirected to Stripe Checkout. After payment, you’ll
              return here to confirm your order status.
            </div>
          </div>
        </div>
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


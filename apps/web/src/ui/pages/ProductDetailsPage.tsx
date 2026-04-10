import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { getProduct } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { Button } from "../components/Button";

export function ProductDetailsPage() {
  const { id } = useParams();
  const cart = useCart();

  const [product, setProduct] = React.useState<Awaited<
    ReturnType<typeof getProduct>
  > | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const p = await getProduct(id);
        if (!cancelled) setProduct(p);
      } catch (e) {
        if (!cancelled) {
          setProduct(null);
          setError(e instanceof Error ? e.message : "Failed to load product");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
        Missing product id.
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Back to products
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-zinc-100" />
          <div className="space-y-3">
            <div className="h-8 w-[75%] animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-[83%] animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = product.images[0];

  return (
    <div className="space-y-6">
      <Link to="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← Back to products
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <motion.div
          className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {primaryImage ? (
            <motion.img
              src={primaryImage}
              alt={product.name}
              className="aspect-square w-full object-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          ) : (
            <div className="aspect-square w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
          )}
        </motion.div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
              {product.category}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="text-lg font-semibold">
              {formatMoney(product.priceCents, product.currency)}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-600">{product.description}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={() => cart.addItem(product.id, 1)}
              className="w-full sm:w-auto"
            >
              Add to cart
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link to="/cart">View cart</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
            Inventory: <span className="font-medium text-zinc-900">{product.inventory}</span>
          </div>
        </div>
      </div>
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


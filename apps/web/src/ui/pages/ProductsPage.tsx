import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { listProducts, type Product } from "../../lib/api";

export function ProductsPage() {
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const data = await listProducts({ q: q || undefined, category });
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) {
          setProducts(null);
          setError(e instanceof Error ? e.message : "Failed to load products");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, category]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of products ?? []) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Browse the catalog. Hover cards for subtle motion, then open a product
          for details.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-2 md:max-w-md">
          <label className="text-xs font-medium text-zinc-600">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or description…"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-violet-400/40 transition focus:ring-4"
          />
        </div>

        <div className="flex w-full flex-col gap-2 md:max-w-xs">
          <label className="text-xs font-medium text-zinc-600">Category</label>
          <select
            value={category ?? ""}
            onChange={(e) =>
              setCategory(e.target.value ? e.target.value : undefined)
            }
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-violet-400/40 transition focus:ring-4"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!products ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-50"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
          No products match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03, ease: "easeOut" }}
            >
              <Link
                to={`/products/${p.id}`}
                className="group block rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                  {p.images[0] ? (
                    <motion.img
                      src={p.images[0]}
                      alt={p.name}
                      className="aspect-[4/3] w-full object-cover"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-600">{p.category}</div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold">
                    {formatMoney(p.priceCents, p.currency)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
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


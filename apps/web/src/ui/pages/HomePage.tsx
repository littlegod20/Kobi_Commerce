import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { listProducts, type Product } from "../../lib/api";

export function HomePage() {
  const [featured, setFeatured] = React.useState<Product[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await listProducts();
        if (cancelled) return;
        setFeatured(all.slice(0, 4));
      } catch {
        if (!cancelled) setFeatured([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-10">
        <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]">
          <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/40 via-fuchsia-400/40 to-cyan-400/40 blur-3xl" />
        </div>

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <motion.h1
              className="text-balance text-4xl font-semibold tracking-tight md:text-5xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              Modern essentials, beautifully crafted.
            </motion.h1>
            <p className="text-pretty text-zinc-600">
              Discover a curated catalog of products with a clean, fast checkout
              powered by Stripe.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                Shop products
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:-translate-y-0.5 hover:bg-zinc-50"
              >
                View cart
              </Link>
            </div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
              alt="Bright retail space with clothing displays and warm lighting"
              className="aspect-[4/3] h-full w-full object-cover"
              width={1600}
              height={1200}
              decoding="async"
              fetchPriority="high"
            />
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-violet-600/15 via-transparent to-cyan-500/10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Quick from cart to door",
            body: "Straightforward checkout and fast fulfillment—so you spend less time waiting and more time enjoying what you ordered.",
          },
          {
            title: "Curated with care",
            body: "Pieces chosen for quality, comfort, and everyday use—not trends that fade after the first week.",
          },
          {
            title: "Pay with confidence",
            body: "Secure card checkout and clear order updates, so you always know your payment went through and where your package is.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="mt-2 text-sm text-zinc-600">{c.body}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
            <p className="mt-1 text-sm text-zinc-600">
              A small preview of what’s in the catalog.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            View all
          </Link>
        </div>

        {!featured ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-50"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
            No products yet — seed the database to see items here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04, ease: "easeOut" }}
              >
                <Link
                  to={`/products/${p.id}`}
                  className="group block rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
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
                  </div>
                  <div className="mt-3 px-1">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-600">{p.category}</div>
                    <div className="mt-2 text-sm font-semibold">
                      {formatMoney(p.priceCents, p.currency)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
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


import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { useCart } from "../../lib/cart";

const linkClass =
  "text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors";
const activeClass = "text-zinc-900";

export function RootLayout() {
  const cart = useCart();
  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <NavLink
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Kobi Commerce home"
          >
            <div className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1.5 text-[12px] font-bold leading-none tracking-tight text-white shadow-sm shadow-violet-500/30">
              KC
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Kobi Commerce
            </span>
          </NavLink>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              <span className="inline-flex items-center gap-2">
                Cart
                {cartCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}


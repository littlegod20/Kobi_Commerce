import { Link } from "react-router-dom";

export function CheckoutCancelPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight">
        Checkout canceled
      </h2>
      <p className="text-sm text-zinc-600">
        No worries — your cart is still here.
      </p>
      <Link
        className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        to="/cart"
      >
        Back to cart
      </Link>
    </div>
  );
}


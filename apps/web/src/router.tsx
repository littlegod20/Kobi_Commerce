import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "./ui/layouts/RootLayout";
import { HomePage } from "./ui/pages/HomePage";
import { ProductsPage } from "./ui/pages/ProductsPage";
import { ProductDetailsPage } from "./ui/pages/ProductDetailsPage";
import { CartPage } from "./ui/pages/CartPage";
import { CheckoutSuccessPage } from "./ui/pages/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./ui/pages/CheckoutCancelPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailsPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout/success", element: <CheckoutSuccessPage /> },
      { path: "checkout/cancel", element: <CheckoutCancelPage /> },
    ],
  },
]);


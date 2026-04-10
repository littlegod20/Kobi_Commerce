import * as React from "react";
import { type CartItem } from "@kobi/shared";

const STORAGE_KEY = "kobi.cart.v1";

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type CartState = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    setItems(readCart());
  }, []);

  React.useEffect(() => {
    writeCart(items);
  }, [items]);

  const api = React.useMemo<CartState>(() => {
    return {
      items,
      addItem(productId, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (!existing) return [...prev, { productId, quantity }];
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        });
      },
      setQuantity(productId, quantity) {
        setItems((prev) => {
          if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          );
        });
      },
      removeItem(productId) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


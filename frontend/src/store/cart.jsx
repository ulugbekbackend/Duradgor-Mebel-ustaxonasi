import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog";

const Ctx = createContext(null);
const LS_KEY = "dg_cart_v1";

export const findProductById = (id) => PRODUCTS.find((p) => p.id === id);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((productId, qty = 1, variant = 0) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === productId && i.variant === variant);
      if (found) {
        return prev.map((i) => (i === found ? { ...i, qty: Math.min(20, i.qty + qty) } : i));
      }
      return [...prev, { productId, variant, qty }];
    });
  }, []);

  const setQty = useCallback((productId, variant, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.variant === variant))
        : prev.map((i) =>
            i.productId === productId && i.variant === variant ? { ...i, qty: Math.min(20, qty) } : i
          )
    );
  }, []);

  const remove = useCallback((productId, variant) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(() => {
    let c = 0;
    let t = 0;
    for (const i of items) {
      const prod = findProductById(i.productId);
      if (!prod) continue;
      c += i.qty;
      t += prod.price * i.qty;
    }
    return { count: c, total: t };
  }, [items]);

  const value = useMemo(
    () => ({ items, count, total, add, setQty, remove, clear }),
    [items, count, total, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart CartProvider ichida chaqirilishi kerak");
  return ctx;
}

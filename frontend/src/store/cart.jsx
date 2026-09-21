import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog";
import { fetchProducts } from "../lib/api";
import { useAsync } from "../lib/useAsync";

/**
 * Savat faqat { productId, variantId, qty } saqlaydi — narx va nomlar har safar
 * backenddan olinadi (useCartLines), shuning uchun savatdagi summa buyurtmadagi bilan bir xil.
 */
const Ctx = createContext(null);
const LS_KEY = "dg_cart_v2";
const LS_KEY_V1 = "dg_cart_v1"; // eski format: variant — indeks

const sameLine = (a, productId, variantId) => a.productId === productId && a.variantId === variantId;

function loadItems() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    // v1 → v2: variant indeksini demo katalogdagi variant id'siga o'giramiz (id'lar seed_demo bilan bir xil)
    const old = JSON.parse(localStorage.getItem(LS_KEY_V1) ?? "[]");
    localStorage.removeItem(LS_KEY_V1);
    return old.map((i) => ({
      productId: i.productId,
      variantId: PRODUCTS.find((p) => p.id === i.productId)?.variants[i.variant]?.id ?? null,
      qty: i.qty,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {
      /* private rejim — savat faqat xotirada */
    }
  }, [items]);

  const add = useCallback((productId, qty = 1, variantId = null) => {
    setItems((prev) => {
      const found = prev.find((i) => sameLine(i, productId, variantId));
      if (found) {
        return prev.map((i) => (i === found ? { ...i, qty: Math.min(20, i.qty + qty) } : i));
      }
      return [...prev, { productId, variantId, qty }];
    });
  }, []);

  const setQty = useCallback((productId, variantId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !sameLine(i, productId, variantId))
        : prev.map((i) => (sameLine(i, productId, variantId) ? { ...i, qty: Math.min(20, qty) } : i))
    );
  }, []);

  const remove = useCallback((productId, variantId) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
  }, []);

  const removeProducts = useCallback((productIds) => {
    const gone = new Set(productIds);
    setItems((prev) => prev.filter((i) => !gone.has(i.productId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((c, i) => c + i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, count, add, setQty, remove, removeProducts, clear }),
    [items, count, add, setQty, remove, removeProducts, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart CartProvider ichida chaqirilishi kerak");
  return ctx;
}

/**
 * Savat qatorlari backenddagi joriy narx bilan:
 * { lines: [{ item, product, variant, unitPrice, lineTotal }], total, loading, error, reload }.
 * Backendda endi yo'q mahsulotlar savatdan o'chiriladi.
 */
export function useCartLines() {
  const { items, removeProducts } = useCart();
  const ids = useMemo(() => [...new Set(items.map((i) => i.productId))].sort((a, b) => a - b), [items]);
  const key = ids.join(",");

  const { data, loading, error, reload } = useAsync(
    () => (ids.length ? fetchProducts({ ids, pageSize: ids.length }) : Promise.resolve({ results: [] })),
    [key]
  );

  const byId = useMemo(() => new Map((data?.results ?? []).map((p) => [p.id, p])), [data]);

  useEffect(() => {
    if (!data) return;
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) removeProducts(missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = byId.get(item.productId);
          if (!product) return null;
          const variant = product.variants.find((v) => v.id === item.variantId) ?? null;
          const unitPrice = product.price + (variant?.price_delta ?? 0);
          return { item, product, variant, unitPrice, lineTotal: unitPrice * item.qty };
        })
        .filter(Boolean),
    [items, byId]
  );
  const total = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);

  // Birinchi yuklanishdagina "loading" — miqdor o'zgarganda sahifa sakramasin
  return { lines, total, loading: loading && !data, error, reload };
}

import { createContext, useCallback, useContext, useMemo } from "react";
import { fetchCategories } from "../lib/api";
import { useAsync } from "../lib/useAsync";

/** Kategoriyalar ilova bo'ylab bir marta yuklanadi (menyu, footer, katalog, kartochkalar). */
const Ctx = createContext(null);

export function CatalogProvider({ children }) {
  const { data, loading, error, reload } = useAsync(fetchCategories, []);
  const categories = data ?? [];

  const getCategory = useCallback((slug) => categories.find((c) => c.slug === slug), [categories]);
  const childrenOf = useCallback((slug) => categories.filter((c) => c.parent === slug), [categories]);
  // Pastki bo'limlar ota bo'limlar tartibida: Mehmonxona → Oshxona → Yotoqxona → Ofis
  const subcategories = useMemo(
    () => categories.filter((c) => !c.parent).flatMap((p) => categories.filter((c) => c.parent === p.slug)),
    [categories]
  );

  const value = useMemo(
    () => ({ categories, subcategories, getCategory, childrenOf, loading, error, reload }),
    [categories, subcategories, getCategory, childrenOf, loading, error, reload]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalog CatalogProvider ichida chaqirilishi kerak");
  return ctx;
}

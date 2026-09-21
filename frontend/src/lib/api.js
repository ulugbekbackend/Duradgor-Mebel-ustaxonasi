/**
 * API qatlami.
 *
 * VITE_API_URL (.env) — API'ning to'liq bazaviy manzili, `/api` bilan birga:
 *   lokal:  VITE_API_URL=http://localhost:8000/api
 *   docker: VITE_API_URL=/api   (nginx backend'ga yo'naltiradi)
 * Ko'rsatilgan bo'lsa haqiqiy Django REST Framework endpoint'lariga so'rov yuboradi:
 *   GET  {API}/catalog/products/?category=&q=&material=&price_min=&price_max=&status=&ordering=&page=&page_size=
 *   POST {API}/orders/
 *
 * Aks holda lokal demo-rejimda ishlaydi (backend'siz ko'rsatish uchun).
 * Matn/rasm/tarjimalar lokal katalogdan (slug bo'yicha) olinadi, narx va stok — API'dan.
 */
import { PRODUCTS, categorySlugs, getProduct } from "../data/catalog";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const norm = (s) => s.toLowerCase().replace(/['ʻ’`]/g, "'");

function applyFilters(list, q) {
  let out = list;
  if (q.category) {
    const set = new Set(categorySlugs(q.category));
    out = out.filter((p) => set.has(p.category));
  }
  if (q.q && q.q.trim()) {
    const needle = norm(q.q.trim());
    out = out.filter(
      (p) =>
        norm(p.name.uz).includes(needle) ||
        norm(p.name.ru).includes(needle) ||
        norm(p.description.uz).includes(needle) ||
        norm(p.description.ru).includes(needle) ||
        norm(p.materialLabel.uz).includes(needle)
    );
  }
  if (q.materials && q.materials.length) out = out.filter((p) => q.materials.includes(p.material));
  if (q.priceMin) out = out.filter((p) => p.price >= q.priceMin);
  if (q.priceMax) out = out.filter((p) => p.price <= q.priceMax);
  if (q.status) out = out.filter((p) => p.status === q.status);
  switch (q.sort) {
    case "price_asc":
      out = [...out].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      out = [...out].sort((a, b) => b.price - a.price);
      break;
    case "popular":
      out = [...out].sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      out = [...out].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }
  return out;
}

/** API mahsulotini sahifalar kutgan shaklga keltiradi. */
function fromApi(p) {
  const live = {
    price: Number(p.price),
    old_price: p.old_price ? Number(p.old_price) : null,
    stock: p.stock,
    status: p.status,
  };
  const local = getProduct(p.slug);
  if (local) return { ...local, ...live };
  // Faqat admin'da qo'shilgan (lokal katalogda yo'q) mahsulot
  const text = { uz: p.name, ru: p.name };
  return {
    ...p,
    ...live,
    name: text,
    description: text,
    materialLabel: { uz: p.material, ru: p.material },
    imageUrl: p.cover,
    variants: [],
  };
}

export async function fetchProducts(q = {}) {
  if (API_URL) {
    const p = new URLSearchParams();
    if (q.category) p.set("category", q.category);
    if (q.q) p.set("q", q.q);
    if (q.materials && q.materials.length) p.set("material", q.materials.join(","));
    if (q.priceMin) p.set("price_min", String(q.priceMin));
    if (q.priceMax) p.set("price_max", String(q.priceMax));
    if (q.status) p.set("status", q.status);
    if (q.sort)
      p.set(
        "ordering",
        q.sort === "price_asc" ? "price" : q.sort === "price_desc" ? "-price" : q.sort === "popular" ? "-popularity" : "-created_at"
      );
    const pageSize = q.pageSize ?? 9;
    p.set("page", String(q.page ?? 1));
    p.set("page_size", String(pageSize));
    const res = await fetch(`${API_URL}/catalog/products/?${p}`);
    if (!res.ok) throw new Error("API xatosi");
    const data = await res.json();
    return {
      results: data.results.map(fromApi),
      count: data.count,
      pages: Math.max(1, Math.ceil(data.count / pageSize)),
    };
  }
  await delay(260);
  const all = applyFilters(PRODUCTS, q);
  const pageSize = q.pageSize ?? 6;
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  const page = Math.min(q.page ?? 1, pages);
  return {
    results: all.slice((page - 1) * pageSize, page * pageSize),
    count: all.length,
    pages,
  };
}

export async function createOrder(payload) {
  if (API_URL) {
    const res = await fetch(`${API_URL}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error("Buyurtma yuborilmadi");
      err.fields = data; // DRF validatsiya xatolari: { phone: [...], items: [...] }
      throw err;
    }
    return data;
  }
  await delay(900);
  // Backend order_number = f"DG-{id}" formatini qaytaradi
  const id = 1400 + Math.floor(Math.random() * 90);
  return { id, order_number: `DG-${id}`, payment_status: "pending" };
}

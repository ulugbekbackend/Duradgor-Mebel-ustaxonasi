/**
 * API qatlami — sahifalar ma'lumotni faqat shu yerdan oladi.
 *
 * VITE_API_URL (.env) — API'ning to'liq bazaviy manzili, `/api` bilan birga:
 *   lokal:  VITE_API_URL=http://localhost:8000/api
 *   docker: VITE_API_URL=/api   (nginx backend'ga yo'naltiradi)
 * Ko'rsatilgan bo'lsa barcha ma'lumot Django REST Framework'dan olinadi:
 *   GET  {API}/catalog/categories/
 *   GET  {API}/catalog/products/?category=&q=&material=&price_min=&price_max=&status=
 *                                &is_featured=&is_new=&ids=&ordering=&page=&page_size=
 *   GET  {API}/catalog/products/{slug}/
 *   POST {API}/orders/
 *   POST {API}/contact/
 *
 * Aks holda demo-rejim: frontend/src/data/catalog.js (backend'siz ko'rsatish uchun).
 * Ikkala rejim ham sahifalarga bir xil shakl qaytaradi:
 *   mahsulot:   { id, slug, name:{uz,ru}, description:{uz,ru}, category, price, old_price, imageUrl,
 *                 gallery:[url], material, materialLabel:{uz,ru}, width, depth, height,
 *                 variants:[{ id, name:{uz,ru}, hex, price_delta }], status, stock, ... }
 *   kategoriya: { id, slug, name:{uz,ru}, parent, imageUrl, products_count }
 */
import { CATEGORIES, MATERIALS, PRODUCTS, categorySlugs, productsOf } from "../data/catalog";
import { IMG } from "../data/images";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
export const USE_API = Boolean(API_URL);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.toLowerCase().replace(/['ʻ’`]/g, "'");
const tr = (uz, ru) => ({ uz: uz ?? "", ru: ru || uz || "" });
const materialName = (key) => MATERIALS.find((m) => m.key === key)?.label ?? tr(key, key);

// Backend'da rasm yuklanmagan bo'lsa — demo suratlar (slug bo'yicha), bo'lmasa umumiy surat
const demoProductImage = (slug) => IMG[PRODUCTS.find((p) => p.slug === slug)?.image] ?? IMG.workshop;
const demoCategoryImage = (slug) => IMG[CATEGORIES.find((c) => c.slug === slug)?.image] ?? IMG.workshop;

async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API xatosi: ${res.status}`);
  return res.json();
}

/* ------------------------------ Normalizatsiya ------------------------------ */
function productFromApi(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: tr(p.name, p.name_ru),
    description: tr(p.description, p.description_ru),
    category: p.category,
    price: Number(p.price),
    old_price: p.old_price ? Number(p.old_price) : null,
    imageUrl: p.cover || demoProductImage(p.slug),
    gallery: (p.images ?? []).map((i) => i.image),
    material: p.material,
    materialLabel: p.material_label ? tr(p.material_label, p.material_label_ru) : materialName(p.material),
    width: p.dimensions?.width ?? p.width,
    depth: p.dimensions?.depth ?? p.depth,
    height: p.dimensions?.height ?? p.height,
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      name: tr(v.name, v.name_ru),
      hex: v.color_code,
      price_delta: Number(v.price_delta),
    })),
    status: p.status,
    stock: p.stock,
    is_featured: p.is_featured,
    is_new: p.is_new,
    popularity: p.popularity,
    created_at: p.created_at,
  };
}

const productFromDemo = (p) => ({
  ...p,
  imageUrl: IMG[p.image],
  gallery: [],
  variants: p.variants.map((v) => ({ ...v, price_delta: v.price_delta ?? 0 })),
});

const categoryFromApi = (c) => ({
  id: c.id,
  slug: c.slug,
  name: tr(c.name, c.name_ru),
  parent: c.parent,
  imageUrl: c.image || demoCategoryImage(c.slug),
  products_count: c.products_count,
});

const categoryFromDemo = (c) => ({ ...c, imageUrl: IMG[c.image], products_count: productsOf(c.slug).length });

/* ------------------------------ Demo filtrlar ------------------------------ */
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
  if (q.featured) out = out.filter((p) => p.is_featured);
  if (q.isNew) out = out.filter((p) => p.is_new);
  if (q.ids) out = out.filter((p) => q.ids.includes(p.id));
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

/* ------------------------------ Katalog ------------------------------ */
export async function fetchCategories() {
  if (USE_API) {
    const data = await getJson("/catalog/categories/");
    return (data ?? []).map(categoryFromApi);
  }
  return CATEGORIES.map(categoryFromDemo);
}

/**
 * Mahsulotlar ro'yxati.
 * q: { category, q, materials[], priceMin, priceMax, status, featured, isNew, ids[], sort, page, pageSize }
 */
export async function fetchProducts(q = {}) {
  const pageSize = q.pageSize ?? 9;
  if (USE_API) {
    const p = new URLSearchParams();
    if (q.category) p.set("category", q.category);
    if (q.q) p.set("q", q.q);
    if (q.materials && q.materials.length) p.set("material", q.materials.join(","));
    if (q.priceMin) p.set("price_min", String(q.priceMin));
    if (q.priceMax) p.set("price_max", String(q.priceMax));
    if (q.status) p.set("status", q.status);
    if (q.featured) p.set("is_featured", "true");
    if (q.isNew) p.set("is_new", "true");
    if (q.ids) p.set("ids", q.ids.join(","));
    if (q.sort)
      p.set(
        "ordering",
        q.sort === "price_asc" ? "price" : q.sort === "price_desc" ? "-price" : q.sort === "popular" ? "-popularity" : "-created_at"
      );
    p.set("page", String(q.page ?? 1));
    p.set("page_size", String(pageSize));
    const data = await getJson(`/catalog/products/?${p}`);
    if (!data) throw new Error("API xatosi: 404");
    return {
      results: data.results.map(productFromApi),
      count: data.count,
      pages: Math.max(1, Math.ceil(data.count / pageSize)),
    };
  }
  await delay(260);
  const all = applyFilters(PRODUCTS, q).map(productFromDemo);
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  const page = Math.min(q.page ?? 1, pages);
  return { results: all.slice((page - 1) * pageSize, page * pageSize), count: all.length, pages };
}

/** Bitta mahsulot (slug bo'yicha); topilmasa null. */
export async function fetchProduct(slug) {
  if (USE_API) {
    const data = await getJson(`/catalog/products/${encodeURIComponent(slug)}/`);
    return data ? productFromApi(data) : null;
  }
  await delay(160);
  const p = PRODUCTS.find((x) => x.slug === slug);
  return p ? productFromDemo(p) : null;
}

/* ------------------------------ Yuborish (POST) ------------------------------ */
async function postJson(path, payload, failMessage) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(failMessage);
    err.status = res.status; // 429 — juda ko'p so'rov (throttle)
    err.fields = data; // DRF validatsiya xatolari: { phone: [...], items: [...] } yoki { detail: "..." }
    throw err;
  }
  return data;
}

export async function createOrder(payload) {
  if (USE_API) return postJson("/orders/", payload, "Buyurtma yuborilmadi");
  await delay(900);
  // Backend order_number = f"DG-{id}" formatini qaytaradi
  const id = 1400 + Math.floor(Math.random() * 90);
  return { id, order_number: `DG-${id}`, payment_status: "pending" };
}

/** Aloqa formasi: { name, phone, message }. */
export async function sendContactMessage(payload) {
  if (USE_API) return postJson("/contact/", payload, "Xabar yuborilmadi");
  await delay(700);
  return { id: 0, ...payload };
}

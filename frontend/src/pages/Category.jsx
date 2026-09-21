import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { MATERIALS, formatPrice } from "../data/catalog";
import { IMG } from "../data/images";
import { fetchProducts } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { useCatalog } from "../store/catalog";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, LoadError, ProductSkeleton, Reveal } from "../components/ui";
import { IconArrow, IconChevron, IconClose, IconFilter, IconHammer, IconShield, IconTruck } from "../components/icons";

const PAGE_SIZE = 6;

export function CategoryPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { t, L } = useI18n();

  const q = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [materials, setMaterials] = useState([]);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("new");
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [mobileFilters, setMobileFilters] = useState(false);

  const { subcategories, getCategory, error: catalogError, reload: reloadCatalog } = useCatalog();
  const category = getCategory(slug);

  // Aktiv chip lentaning ko'rinadigan qismida bo'lsin (faqat gorizontal — sahifa siljimaydi)
  const chipsRef = useRef(null);
  useEffect(() => {
    const box = chipsRef.current;
    const chip = box?.querySelector('[aria-current="page"]');
    if (!box || !chip) return;
    box.scrollLeft = chip.offsetLeft - box.offsetLeft - (box.clientWidth - chip.offsetWidth) / 2;
  }, [slug, subcategories]);

  useSEO({
    title: `${category ? L(category.name) : t("nav_catalog")} — Duradgor Mebel katalogi`,
    description: category
      ? `${L(category.name)}: qo'lda ishlangan mebel, narxlar va o'lchamlar. Duradgor ustaxonasi, Toshkent.`
      : "Duradgor ustaxonasi katalogi: divan, karavot, oshxona va ofis mebellari.",
    image: category ? category.imageUrl : IMG.workshop,
  });

  // slug o'zgarganda filtrlarni tozalash
  useEffect(() => {
    setPriceMin("");
    setPriceMax("");
    setMaterials([]);
    setStatus("");
    setSort("new");
    setParams(
      (p) => {
        p.delete("page");
        return p;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const query = useMemo(
    () => ({
      category: slug,
      q: q || undefined,
      materials,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      status: status || undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [slug, q, materials, priceMin, priceMax, status, sort, page]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(false);
    fetchProducts(query)
      .then((res) => {
        if (!alive) return;
        setItems(res.results);
        setCount(res.count);
        setPages(res.pages);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
        setLoadError(true); // server javob bermadi — bu "mahsulot yo'q" emas
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query, retryNonce]);

  const retry = () => {
    setRetryNonce((n) => n + 1);
    if (catalogError) reloadCatalog();
  };

  const setPage = useCallback(
    (p) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (p > 1) next.set("page", String(p));
          else next.delete("page");
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams]
  );

  const hasFilters = !!(materials.length || status || priceMin || priceMax || q);
  const reset = () => {
    setPriceMin("");
    setPriceMax("");
    setMaterials([]);
    setStatus("");
    setParams(
      (p) => {
        p.delete("q");
        p.delete("page");
        return p;
      },
      { replace: true }
    );
  };

  const toggleMaterial = (k) =>
    setMaterials((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const inputCls =
    "w-full rounded-lg border border-line bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-honey-500 focus:ring-2 focus:ring-honey-400/40";

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-walnut">{t("f_price")}</h4>
        <div className="flex items-center gap-2">
          <input type="number" min={0} placeholder={t("f_from")} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={inputCls} />
          <span className="text-walnut">–</span>
          <input type="number" min={0} placeholder={t("f_to")} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-walnut">{t("f_material")}</h4>
        <div className="space-y-2">
          {MATERIALS.map((m) => (
            <label key={m.key} className="group flex cursor-pointer items-center gap-2.5 text-[14.5px]">
              <span
                className={`grid size-5 place-items-center rounded border transition ${
                  materials.includes(m.key) ? "border-pine-800 bg-pine-800" : "border-line bg-white/70 group-hover:border-honey-500"
                }`}
              >
                {materials.includes(m.key) && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#faeac5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </span>
              <input type="checkbox" checked={materials.includes(m.key)} onChange={() => toggleMaterial(m.key)} className="sr-only" />
              {L(m.label)}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-walnut">{t("f_availability")}</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", label: t("f_all") },
            { v: "in_stock", label: t("f_instock") },
            { v: "on_order", label: t("f_onorder") },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setStatus(o.v)}
              className={`rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                status === o.v
                  ? "border-pine-800 bg-pine-800 text-paper"
                  : "border-line bg-white/70 text-walnut hover:border-honey-500 hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && (
        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-bold text-walnut transition hover:border-rust hover:text-rust"
        >
          <IconClose width={15} height={15} /> {t("f_reset")}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ============ KATEGORIYA BANNERI ============ */}
      <section className="noise relative overflow-hidden bg-pine-900 text-paper">
        <div className="woodlines absolute inset-0" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-pine-700/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_300px] lg:py-14">
          <div className="anim-rise">
            <nav className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-paper/60">
              <Link to="/" className="transition hover:text-honey-300">{t("bc_home")}</Link>
              <IconChevron width={12} height={12} />
              <Link to="/katalog" className="transition hover:text-honey-300">{t("bc_catalog")}</Link>
              {category && (
                <>
                  <IconChevron width={12} height={12} />
                  <span className="text-honey-300">{L(category.name)}</span>
                </>
              )}
            </nav>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {q ? `${t("search_for")} “${q}”` : category ? L(category.name) : t("nav_catalog")}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-paper/70">
              {t("cat_sub")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {[
                { icon: <IconHammer width={15} height={15} />, label: t("cat_handmade") },
                { icon: <IconShield width={15} height={15} />, label: t("cat_warranty") },
                { icon: <IconTruck width={15} height={15} />, label: t("cat_delivery") },
              ].map((b) => (
                <span key={b.label} className="flex items-center gap-1.5 rounded-full border border-paper/20 bg-paper/5 px-3.5 py-1.5 text-[12px] font-bold text-honey-300">
                  {b.icon} {b.label}
                </span>
              ))}
              {!loading && !loadError && (
                <span className="flex items-center gap-1.5 rounded-full bg-honey-400 px-3.5 py-1.5 text-[12px] font-extrabold text-pine-950">
                  {count} {t("results")}
                </span>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border-4 border-paper/15 shadow-lift">
              <img
                src={category ? category.imageUrl : IMG.workshop}
                alt={category ? L(category.name) : "Duradgor"}
                className="anim-kenburns aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ ASOSIY QISM ============ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          {/* Kategoriya chiplari */}
          <div ref={chipsRef} className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
            {/* Doim barcha bo'limlar ko'rinadi; tanlangani ajratiladi */}
            {[{ slug: "", name: null }, ...subcategories].map((c) => {
              const active = c.slug === (slug ?? "");
              return (
                <Link
                  key={c.slug || "all"}
                  to={c.slug ? `/katalog/${c.slug}` : "/katalog"}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                    active
                      ? "border-pine-800 bg-pine-800 text-paper"
                      : "border-line bg-white/70 text-walnut hover:border-pine-800 hover:bg-pine-800 hover:text-paper"
                  }`}
                >
                  {c.name ? L(c.name) : t("f_all")}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white/70 px-5 py-2.5 text-sm font-bold transition hover:border-honey-500 lg:hidden"
            >
              <IconFilter width={16} height={16} /> {t("filters")}
              {hasFilters && <span className="size-2 rounded-full bg-rust" />}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden font-bold text-walnut sm:inline">{t("sort")}:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-white/80 px-4 py-2.5 text-[13.5px] font-bold outline-none transition focus:border-honey-500"
              >
                <option value="new">{t("sort_new")}</option>
                <option value="popular">{t("sort_pop")}</option>
                <option value="price_asc">{t("sort_asc")}</option>
                <option value="price_desc">{t("sort_desc")}</option>
              </select>
            </label>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Filtrlar — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-xl border border-line bg-white/60 p-5">{filterPanel}</div>
          </aside>

          {/* Filtrlar — mobil */}
          {mobileFilters && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              <div className="absolute inset-0 bg-pine-950/60 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
              <div className="anim-rise absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col overflow-y-auto bg-paper p-5 shadow-lift">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold">{t("filters")}</h3>
                  <button onClick={() => setMobileFilters(false)} className="grid size-9 place-items-center rounded-full border border-line" aria-label="Yopish">
                    <IconClose width={16} height={16} />
                  </button>
                </div>
                {filterPanel}
                <button
                  onClick={() => setMobileFilters(false)}
                  className="mt-6 rounded-full bg-pine-900 py-3 font-bold text-paper"
                >
                  {count} {t("results")}
                </button>
              </div>
            </div>
          )}

          {/* Mahsulotlar */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : loadError ? (
              <LoadError onRetry={retry} />
            ) : items.length === 0 ? (
              <EmptyState title={t("empty_title")} text={t("empty_text")}>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-3 font-bold text-paper transition hover:bg-pine-800"
                >
                  {t("f_reset")}
                </button>
              </EmptyState>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                  {items.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>

                {pages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="grid size-10 place-items-center rounded-full border border-line bg-white/70 transition enabled:hover:border-honey-500 disabled:opacity-40"
                      aria-label="Oldingi"
                    >
                      <IconChevron width={16} height={16} className="rotate-180" />
                    </button>
                    {Array.from({ length: pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`size-10 rounded-full text-sm font-bold transition ${
                          page === i + 1 ? "bg-pine-900 text-paper shadow-card" : "border border-line bg-white/70 hover:border-honey-500"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={page === pages}
                      onClick={() => setPage(page + 1)}
                      className="grid size-10 place-items-center rounded-full border border-line bg-white/70 transition enabled:hover:border-honey-500 disabled:opacity-40"
                      aria-label="Keyingi"
                    >
                      <IconChevron width={16} height={16} />
                    </button>
                  </nav>
                )}
              </>
            )}

            {!loading && items.length > 0 && (
              <p className="mt-6 text-center text-[12.5px] text-walnut/80">
                {formatPrice(Math.min(...items.map((x) => x.price)))} — {formatPrice(Math.max(...items.map((x) => x.price)))}
              </p>
            )}
          </div>
        </div>

        {/* ============ BARCHA BO'LIMLAR ============ */}
        {!slug && (
          <section className="mt-16">
            <Reveal className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("cat_sections")}</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {subcategories.map((c, i) => (
                <Reveal key={c.slug} delay={i * 50}>
                  <Link
                    to={`/katalog/${c.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-white/70 p-3.5 transition hover:-translate-y-1 hover:border-honey-400 hover:shadow-card"
                  >
                    <img src={c.imageUrl} alt="" className="size-14 shrink-0 rounded-lg object-cover transition duration-500 group-hover:scale-105" />
                    <span className="min-w-0">
                      <span className="font-display block truncate text-[15px] font-semibold">{L(c.name)}</span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-bold text-honey-600">
                        {t("link_all")} <IconArrow width={12} height={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { IMG } from "../data/images";
import { formatPrice } from "../data/catalog";
import { fetchProducts } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { useCatalog } from "../store/catalog";
import { ProductCard } from "../components/ProductCard";
import { LoadError, ProductSkeleton, Reveal, Stars } from "../components/ui";
import { PHONE, PHONE_HREF, TG_LINK } from "../components/layout";
import {
  IconArrow, IconHammer, IconPhone, IconPot, IconRuler, IconSpark, IconSofa, IconBed, IconDesk, IconTelegram, IconTruck,
} from "../components/icons";

const CAT_ICONS = {
  sofas: <IconSofa width={18} height={18} />,
  armchairs: <IconSofa width={18} height={18} />,
  "coffee-tables": <IconDesk width={18} height={18} />,
  "kitchen-sets": <IconPot width={18} height={18} />,
  dining: <IconPot width={18} height={18} />,
  beds: <IconBed width={18} height={18} />,
  wardrobes: <IconBed width={18} height={18} />,
  desks: <IconDesk width={18} height={18} />,
};

function RotatingBadge() {
  return (
    <div className="anim-spin-slow absolute -left-6 top-8 z-10 hidden size-28 sm:block lg:-left-12">
      <svg viewBox="0 0 100 100" className="size-full drop-shadow-lg">
        <defs>
          <path id="circ" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="#eab64f" />
        <text fontSize="10.2" fontWeight="700" letterSpacing="1.6" fill="#0c2118">
          <textPath href="#circ">QO'L ISHI • TABIIY YOGOCH • 2009-YILDAN •</textPath>
        </text>
        <path d="M40 52.5 47 59l13-14" stroke="#0c2118" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function HomePage() {
  const { t, L } = useI18n();
  const [tab, setTab] = useState("all");

  useSEO({
    title: "Duradgor Mebel — Qo'lda ishlangan mebel ustaxonasi | Toshkent",
    description:
      "Tabiiy yog'ochdan divan, karavot, oshxona va ofis mebellari. O'lcham bo'yicha buyurtma, 24 oy kafolat, Toshkent bo'ylab bepul yetkazib berish.",
    image: IMG.workshop,
  });

  const { subcategories: leaves, error: catalogError, reload: reloadCatalog } = useCatalog();

  // Vitrina: tab bo'yicha backenddan (8 tagacha)
  const showcase = useAsync(
    () => fetchProducts({ sort: "new", pageSize: 8, isNew: tab === "new", featured: tab === "feat" }),
    [tab]
  );
  const shown = showcase.data?.results ?? [];

  // Hero kartochkasi: eng yangi tavsiya etilgan mahsulot
  const hero = useAsync(() => fetchProducts({ featured: true, sort: "new", pageSize: 1 }), []);
  const heroProduct = hero.data?.results[0];

  const marquee = [t("m1"), t("m2"), t("m3"), t("m4"), t("m5"), t("m6")];
  const steps = [
    { icon: <IconRuler width={22} height={22} />, n: "01", title: "step1", text: "step1t" },
    { icon: <IconHammer width={22} height={22} />, n: "02", title: "step2", text: "step2t" },
    { icon: <IconHammer width={22} height={22} />, n: "03", title: "step3", text: "step3t" },
    { icon: <IconTruck width={22} height={22} />, n: "04", title: "step4", text: "step4t" },
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="noise relative overflow-hidden bg-pine-900 text-paper">
        <div className="woodlines absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-pine-700/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 -left-32 size-[480px] rounded-full bg-honey-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="anim-rise flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.18em] text-honey-300">
              <span className="h-px w-8 bg-honey-400" /> {t("hero_eyebrow")}
            </p>
            <h1 className="font-display mt-5 text-[42px] font-semibold leading-[1.05] tracking-tight sm:text-6xl xl:text-[68px]">
              {t("hero_t1")} <em className="italic text-honey-300">{t("hero_em")}</em> {t("hero_t2")}
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-paper/75">{t("hero_sub")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/katalog"
                className="group inline-flex items-center gap-2.5 rounded-full bg-honey-400 px-7 py-3.5 font-bold text-pine-950 shadow-lift transition hover:bg-honey-300 active:scale-95"
              >
                {t("hero_cta1")}
                <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={TG_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-paper/30 px-7 py-3.5 font-bold text-paper transition hover:border-honey-300 hover:text-honey-300 active:scale-95"
              >
                <IconTelegram width={17} height={17} /> {t("hero_cta2")}
              </a>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-paper/15 pt-7">
              {[
                { v: "16+", k: t("stat1") },
                { v: "1400+", k: t("stat2") },
                { v: "24", k: t("stat3") },
              ].map((s, i) => (
                <div key={s.k} className={`anim-rise ${i === 1 ? "sm:translate-y-2" : ""}`}>
                  <dt className="font-display text-3xl font-bold text-honey-300 sm:text-4xl">{s.v}</dt>
                  <dd className="mt-1 text-[12.5px] font-medium uppercase tracking-wide text-paper/60">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-6">
            <RotatingBadge />
            <div className="relative mx-auto max-w-md overflow-hidden rounded-t-[999px] rounded-b-2xl border-4 border-paper/15 shadow-lift lg:ml-auto">
              <img
                src={IMG.armchair}
                alt={t("hero_cta1")}
                className="anim-kenburns aspect-[4/5] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pine-950/50 via-transparent to-transparent" />
            </div>
            {/* Suzuvchi mahsulot kartochkasi */}
            {heroProduct && (
              <Link
                to={`/mahsulot/${heroProduct.slug}`}
                className="anim-float absolute -bottom-5 left-2 flex items-center gap-3 rounded-xl border border-line bg-paper p-3 pr-5 text-ink shadow-lift transition hover:scale-[1.03] sm:left-6"
              >
                <img src={heroProduct.imageUrl} alt="" className="size-14 rounded-lg object-cover" />
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-honey-600">{t("hero_price_from")} {formatPrice(heroProduct.price)}</span>
                  <span className="font-display block text-[15px] font-semibold leading-tight">{L(heroProduct.name)}</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="overflow-hidden border-y border-honey-600/30 bg-honey-400 py-3 text-pine-950">
        <div className="anim-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[...marquee, ...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-extrabold uppercase tracking-[0.14em]">
              {m} <IconSpark className="opacity-70" />
            </span>
          ))}
        </div>
      </div>

      {/* ================= KATEGORIYALAR ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">{t("sec_categories_sub")}</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("sec_categories")}</h2>
          </div>
          <Link to="/katalog" className="group inline-flex items-center gap-2 font-bold text-pine-800 transition hover:text-honey-600">
            {t("link_all")} <IconArrow width={17} height={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:-mx-6 sm:px-6">
          {leaves.map((c, i) => {
            const count = c.products_count;
            return (
              <Reveal key={c.slug} delay={i * 60} className="snap-start">
                <Link
                  to={`/katalog/${c.slug}`}
                  className="group relative block h-72 w-48 shrink-0 overflow-hidden rounded-xl border border-line shadow-[0_2px_14px_-10px_rgb(36_29_18/0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card sm:w-56"
                >
                  <img src={c.imageUrl} alt={L(c.name)} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
                    <span className="flex items-center gap-2 text-honey-300">
                      {CAT_ICONS[c.slug]}
                      <span className="text-[11px] font-bold uppercase tracking-wider">{count} {t("items").toLowerCase()}</span>
                    </span>
                    <h3 className="font-display mt-1 text-lg font-semibold leading-tight">{L(c.name)}</h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-honey-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      {t("link_all")} <IconArrow width={14} height={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= VITRINA ================= */}
      <section className="border-y border-line bg-sand/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">{t("sec_products_sub")}</p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("sec_products")}</h2>
            </div>
            <div className="flex rounded-full border border-line bg-paper p-1">
              {[
                { k: "all", label: t("tab_all") },
                { k: "new", label: t("tab_new") },
                { k: "feat", label: t("tab_feat") },
              ].map((x) => (
                <button
                  key={x.k}
                  onClick={() => setTab(x.k)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 ${
                    tab === x.k ? "bg-pine-900 text-paper shadow-card" : "text-walnut hover:text-ink"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </Reveal>

          {showcase.error ? (
            <LoadError
              onRetry={() => {
                showcase.reload();
                hero.reload();
                if (catalogError) reloadCatalog();
              }}
            />
          ) : (
            <div key={tab} className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {showcase.loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
                : shown.map((p, i) => <ProductCard key={`${tab}-${p.id}`} product={p} index={i} />)}
            </div>
          )}

          <Reveal className="mt-10 text-center">
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-pine-900 px-8 py-3.5 font-bold text-pine-900 transition hover:bg-pine-900 hover:text-paper active:scale-95"
            >
              {t("nav_catalog")} <IconArrow width={17} height={17} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= MAXSUS BUYURTMA ================= */}
      <section className="noise relative overflow-hidden bg-pine-800 text-paper">
        <div className="woodlines absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <Reveal>
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-300">Duradgor • {t("f_custom")}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-[42px]">
              {t("custom_title")}
            </h2>
            <p className="mt-5 max-w-lg text-paper/75">{t("custom_text")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/aloqa"
                className="inline-flex items-center gap-2.5 rounded-full bg-honey-400 px-7 py-3.5 font-bold text-pine-950 transition hover:bg-honey-300 active:scale-95"
              >
                <IconRuler width={18} height={18} /> {t("custom_cta")}
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2.5 rounded-full border border-paper/30 px-7 py-3.5 font-bold transition hover:border-honey-300 hover:text-honey-300"
              >
                <IconPhone width={17} height={17} /> {PHONE}
              </a>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div className="overflow-hidden rounded-xl border-4 border-paper/15 shadow-lift">
              <img src={IMG.workshop} alt={t("about_title")} loading="lazy" className="anim-kenburns aspect-[16/10] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 right-4 rounded-xl bg-honey-400 px-5 py-3 text-pine-950 shadow-lift">
              <span className="font-display block text-2xl font-bold leading-none">10–20</span>
              <span className="text-[12px] font-bold uppercase tracking-wider">{t("step3")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= JARAYON ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">{t("process_sub")}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("process_title")}</h2>
        </Reveal>
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-line lg:block" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 110} className={`relative ${i % 2 ? "lg:translate-y-6" : ""}`}>
              <div className="relative z-10 flex size-14 items-center justify-center rounded-full border-2 border-honey-500 bg-paper text-pine-900 shadow-card">
                {s.icon}
              </div>
              <p className="font-display mt-4 text-4xl font-bold text-pine-900/12">{s.n}</p>
              <h3 className="font-display -mt-2 text-xl font-semibold">{t(s.title)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-walnut">{t(s.text)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= USTA HAQIDA ================= */}
      <section className="border-y border-line bg-sand/60">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20">
          <Reveal className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-xl border-4 border-paper shadow-lift">
              <img src={IMG.workshop} alt={t("about_title")} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="absolute -bottom-5 -right-3 rounded-xl border border-line bg-paper px-5 py-3.5 shadow-card sm:-right-6">
              <p className="font-display text-2xl font-bold text-pine-900">2009</p>
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-honey-600">{t("stat1")}</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7 lg:pl-6">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">Duradgor</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("about_title")}</h2>
            <p className="mt-5 leading-relaxed text-ink/85">{t("about_p1")}</p>
            <p className="mt-4 leading-relaxed text-ink/85">{t("about_p2")}</p>
            <blockquote className="mt-7 border-l-4 border-honey-500 pl-5">
              <p className="font-display text-xl italic text-pine-900">{t("about_sig")}</p>
              <footer className="mt-1.5 text-sm font-semibold text-walnut">{t("about_by")}</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ================= FIKRLAR ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">1400+ {t("stat2")}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("reviews_title")}</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { txt: t("r1"), n: t("r1n"), c: t("r1c"), off: "" },
            { txt: t("r2"), n: t("r2n"), c: t("r2c"), off: "md:translate-y-8" },
            { txt: t("r3"), n: t("r3n"), c: t("r3c"), off: "md:translate-y-3" },
          ].map((r, i) => (
            <Reveal key={r.n} delay={i * 100} className={r.off}>
              <figure className="flex h-full flex-col rounded-xl border border-line bg-white/70 p-6 shadow-[0_2px_14px_-10px_rgb(36_29_18/0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <Stars />
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink/85">“{r.txt}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="font-display grid size-10 place-items-center rounded-full bg-pine-900 text-sm font-bold text-honey-300">
                    {r.n[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{r.n}</span>
                    <span className="block text-xs text-walnut">{r.c}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="noise relative overflow-hidden bg-honey-400">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-7 px-4 py-14 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-pine-950 sm:text-[42px]">{t("cta_title")}</h2>
            <p className="mt-2 font-semibold text-pine-900/75">{t("cta_sub")}</p>
          </Reveal>
          <Reveal delay={100} className="flex flex-wrap justify-center gap-4">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2.5 rounded-full bg-pine-950 px-8 py-4 font-bold text-paper shadow-lift transition hover:bg-pine-900 active:scale-95"
            >
              <IconPhone width={18} height={18} className="text-honey-300" /> {t("cta_call")}
            </a>
            <a
              href={TG_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-pine-950 px-8 py-4 font-bold text-pine-950 transition hover:bg-pine-950 hover:text-honey-300 active:scale-95"
            >
              <IconTelegram width={18} height={18} /> {t("cta_tg")}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

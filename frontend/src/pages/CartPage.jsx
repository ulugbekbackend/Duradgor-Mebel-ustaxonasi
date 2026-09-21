import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IMG } from "../data/images";
import { PRODUCTS, formatPrice } from "../data/catalog";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { findProductById, useCart } from "../store/cart";
import { EmptyState, QtyStepper, Reveal, useToast } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { IconArrow, IconCard, IconCheck, IconShield, IconTrash, IconTruck } from "../components/icons";

export function CartPage() {
  const { t, L } = useI18n();
  const { items, setQty, remove, clear, total, count } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useSEO({ title: `${t("cart_title")} — Duradgor Mebel` });

  // Savatda yo'q mahsulotlardan tavsiyalar
  const maybe = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    return PRODUCTS.filter((p) => !inCart.has(p.id)).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="font-display text-center text-3xl font-semibold sm:text-4xl">{t("cart_title")}</h1>
        <EmptyState title={t("cart_empty_t")} text={t("cart_empty_p")}>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2.5 rounded-full bg-pine-900 px-7 py-3.5 font-bold text-paper transition hover:bg-pine-800 active:scale-95"
          >
            {t("to_catalog")} <IconArrow width={17} height={17} />
          </Link>
        </EmptyState>
        {/* Bo'sh savatda ham tavsiya ko'rsatamiz */}
        <section className="mt-8">
          <Reveal className="mb-5 text-center">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{t("cart_maybe")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {maybe.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("cart_title")} <span className="text-walnut/60">({count})</span>
        </h1>
        <button
          onClick={() => {
            clear();
            toast(t("toast_removed"));
          }}
          className="flex items-center gap-2 text-sm font-bold text-walnut transition hover:text-rust"
        >
          <IconTrash width={16} height={16} /> {t("clear_cart")}
        </button>
      </Reveal>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item, idx) => {
            const p = findProductById(item.productId);
            if (!p) return null;
            const v = p.variants[item.variant] ?? p.variants[0];
            return (
              <Reveal key={`${item.productId}-${item.variant}`} delay={idx * 60}>
                <div className="flex gap-4 rounded-xl border border-line bg-white/70 p-3.5 shadow-[0_2px_12px_-10px_rgb(36_29_18/0.35)] transition hover:border-honey-400/60 sm:items-center sm:p-4">
                  <Link to={`/mahsulot/${p.slug}`} className="shrink-0">
                    <img src={IMG[p.image]} alt={L(p.name)} className="size-24 rounded-lg object-cover sm:size-28" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <Link to={`/mahsulot/${p.slug}`} className="font-display block truncate text-[17px] font-semibold transition hover:text-pine-800">
                        {L(p.name)}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-2 text-[13px] text-walnut">
                        <span className="size-3 rounded-full border border-line" style={{ backgroundColor: v.hex }} />
                        {L(v.name)} · {L(p.materialLabel)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-walnut sm:hidden">{formatPrice(p.price)}</p>
                      {p.status === "on_order" && (
                        <p className="mt-1 inline-block rounded-full bg-honey-100 px-2.5 py-0.5 text-[11.5px] font-bold text-honey-700">
                          {t("on_order_note")}
                        </p>
                      )}
                    </div>
                    <p className="hidden w-36 text-[15px] font-bold sm:block">{formatPrice(p.price)}</p>
                    <QtyStepper small value={item.qty} onChange={(q) => setQty(item.productId, item.variant, q)} />
                    <p className="w-32 text-right text-[16px] font-extrabold text-pine-900">{formatPrice(p.price * item.qty)}</p>
                    <button
                      onClick={() => {
                        remove(item.productId, item.variant);
                        toast(t("toast_removed"));
                      }}
                      aria-label={t("remove")}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-walnut transition hover:bg-rust/10 hover:text-rust"
                    >
                      <IconTrash width={17} height={17} />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}

          {/* Afzalliklar lentasi */}
          <Reveal delay={120}>
            <div className="grid gap-3 rounded-xl border border-line bg-pine-100/60 p-4 sm:grid-cols-3">
              {[
                { icon: <IconTruck width={19} height={19} />, txt: t("trust1") },
                { icon: <IconShield width={19} height={19} />, txt: t("trust2") },
                { icon: <IconCard width={19} height={19} />, txt: t("trust3") },
              ].map((x) => (
                <div key={x.txt} className="flex items-center gap-2.5 text-[13px] font-semibold text-pine-900">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300">{x.icon}</span>
                  {x.txt}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Xulosa */}
        <Reveal delay={150}>
          <aside className="sticky top-32 rounded-xl border border-line bg-white/70 p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">{t("co_your")}</h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-walnut">{t("subtotal")}</dt>
                <dd className="font-bold">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1.5 text-walnut">
                  <IconTruck width={16} height={16} className="text-honey-600" /> {t("delivery")}
                </dt>
                <dd className="font-bold text-pine-700">{t("free")}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                <dt className="font-bold">{t("grand")}</dt>
                <dd className="font-display text-2xl font-bold text-pine-900">{formatPrice(total)}</dd>
              </div>
            </dl>
            <button
              onClick={() => navigate("/buyurtma")}
              className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-honey-400 py-4 font-bold text-pine-950 shadow-card transition hover:bg-honey-300 active:scale-[0.98]"
            >
              {t("checkout")}
              <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3.5 flex items-start gap-2 text-[12px] leading-relaxed text-walnut/85">
              <IconCheck width={14} height={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-pine-700" />
              {t("cart_note")}
            </p>
          </aside>
        </Reveal>
      </div>

      {/* Tavsiyalar */}
      {maybe.length > 0 && (
        <section className="mt-16">
          <Reveal className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("cart_maybe")}</h2>
            <Link to="/katalog" className="group inline-flex items-center gap-2 font-bold text-pine-800 transition hover:text-honey-600">
              {t("link_all")} <IconArrow width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {maybe.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IMG } from "../data/images";
import { discountOf, formatPrice, getCategory, getProduct, similarTo } from "../data/catalog";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { useCart } from "../store/cart";
import { QtyStepper, Reveal, useToast, EmptyState } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { TG_LINK } from "../components/layout";
import {
  IconArrow, IconCard, IconCart, IconCheck, IconChevron, IconFacebook, IconLink,
  IconRuler, IconShield, IconTelegram, IconTruck, IconX,
} from "../components/icons";

export function ProductPage() {
  const { slug } = useParams();
  const product = getProduct(slug);
  const { t, L } = useI18n();
  const { add } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [imgIdx, setImgIdx] = useState(0);
  const [variant, setVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef(undefined);

  const category = product ? getCategory(product.category) : undefined;
  const similar = useMemo(() => (product ? similarTo(product) : []), [product]);

  useSEO({
    title: product ? `${L(product.name)} — ${formatPrice(product.price)} | Duradgor Mebel` : "Mahsulot — Duradgor Mebel",
    description: product ? L(product.description).slice(0, 160) : undefined,
    image: product ? IMG[product.image] : undefined,
  });

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title={t("not_found_t")} text={t("not_found_p")}>
          <Link to="/katalog" className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-3 font-bold text-paper transition hover:bg-pine-800">
            {t("to_catalog")} <IconArrow width={16} height={16} />
          </Link>
        </EmptyState>
      </div>
    );
  }

  const sale = discountOf(product);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${L(product.name)} — ${formatPrice(product.price)}`;

  const gallery = [
    { src: IMG[product.image], label: L(product.name), cls: "" },
    { src: IMG.workshop, label: "Ustaxona", cls: "" },
    { src: IMG[product.image], label: "Detal", cls: "scale-[1.75]" },
  ];

  const onAdd = () => {
    add(product.id, qty, variant);
    toast(t("toast_added"));
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1500);
  };

  const onBuyNow = () => {
    add(product.id, qty, variant);
    navigate("/buyurtma");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast(t("link_copied"));
    } catch {
      toast(shareUrl);
    }
  };

  const specs = [
    [t("sp_dims"), `${product.width} × ${product.depth} × ${product.height} sm`],
    [t("sp_material"), L(product.materialLabel)],
    [t("sp_colors"), product.variants.map((v) => L(v.name)).join(", ")],
    [t("sp_maker"), "Duradgor ustaxonasi, Toshkent"],
    [t("sp_warranty"), "24 oy"],
    [t("sp_status"), product.status === "in_stock" ? `${t("in_stock")} — ${product.stock} ${t("pieces")}` : t("on_order_note")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Non ushagi */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-walnut">
        <Link to="/" className="transition hover:text-honey-600">{t("bc_home")}</Link>
        <IconChevron width={12} height={12} className="text-line" />
        <Link to="/katalog" className="transition hover:text-honey-600">{t("bc_catalog")}</Link>
        {category && (
          <>
            <IconChevron width={12} height={12} className="text-line" />
            <Link to={`/katalog/${category.slug}`} className="transition hover:text-honey-600">{L(category.name)}</Link>
          </>
        )}
        <IconChevron width={12} height={12} className="text-line" />
        <span className="text-ink">{L(product.name)}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Galereya */}
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-line bg-sand shadow-card">
            <img
              key={imgIdx}
              src={gallery[imgIdx].src}
              alt={gallery[imgIdx].label}
              className={`anim-rise aspect-[4/5] w-full object-cover transition-transform duration-700 sm:aspect-[5/5] ${gallery[imgIdx].cls}`}
            />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              {product.is_new && <span className="rounded-full bg-honey-400 px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-wide text-pine-950">{t("new")}</span>}
              {sale > 0 && <span className="rounded-full bg-rust px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-wide text-paper">−{sale}%</span>}
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                aria-label={g.label}
                className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition sm:w-20 ${
                  imgIdx === i ? "border-honey-500 shadow-card" : "border-line opacity-70 hover:opacity-100"
                }`}
              >
                <img src={g.src} alt="" className={`size-full object-cover ${g.cls}`} />
              </button>
            ))}
          </div>
        </Reveal>

        {/* Ma'lumot */}
        <Reveal delay={100}>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-honey-600">
            {category ? L(category.name) : ""}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-[40px]">
            {L(product.name)}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${
                product.status === "in_stock" ? "bg-pine-100 text-pine-800" : "bg-honey-100 text-honey-700"
              }`}
            >
              <span className={`size-2 rounded-full ${product.status === "in_stock" ? "bg-pine-700" : "bg-honey-500"} animate-pulse`} />
              {product.status === "in_stock" ? `${t("in_stock")} · ${product.stock} ${t("stock_left")}` : t("on_order")}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-[34px] font-bold leading-none text-pine-900">{formatPrice(product.price)}</p>
            {product.old_price && (
              <p className="pb-0.5 text-lg font-semibold text-walnut/70 line-through">{formatPrice(product.old_price)}</p>
            )}
          </div>

          {/* Rang variantlari */}
          <div className="mt-6">
            <p className="text-sm font-bold text-walnut">
              {t("color")} <span className="text-ink">{L(product.variants[variant].name)}</span>
            </p>
            <div className="mt-2.5 flex gap-2.5">
              {product.variants.map((v, i) => (
                <button
                  key={v.hex}
                  onClick={() => setVariant(i)}
                  title={L(v.name)}
                  aria-label={L(v.name)}
                  className={`size-9 rounded-full border-2 transition-all duration-200 ${
                    variant === i ? "scale-110 border-pine-900 ring-2 ring-honey-400 ring-offset-2 ring-offset-paper" : "border-line hover:scale-105"
                  }`}
                  style={{ backgroundColor: v.hex }}
                />
              ))}
            </div>
          </div>

          {/* Miqdor + tugmalar */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <QtyStepper value={qty} onChange={setQty} />
            <button
              onClick={onAdd}
              className={`inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-7 py-3.5 font-bold text-paper shadow-card transition active:scale-95 sm:flex-none ${
                added ? "bg-pine-700" : "bg-pine-900 hover:bg-pine-800"
              }`}
            >
              {added ? <IconCheck width={18} height={18} strokeWidth={2.4} /> : <IconCart width={18} height={18} />}
              {added ? t("added") : t("add_cart")}
            </button>
          </div>
          <button
            onClick={onBuyNow}
            className="mt-3.5 w-full rounded-full bg-honey-400 px-7 py-3.5 font-bold text-pine-950 transition hover:bg-honey-300 active:scale-[0.98]"
          >
            {t("buy_now")}
          </button>

          {/* Ulashish */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-bold text-walnut">{t("share")}</span>
            {[
              {
                label: "Telegram",
                href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                icon: <IconTelegram width={16} height={16} />,
              },
              {
                label: "Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                icon: <IconFacebook width={16} height={16} />,
              },
              {
                label: "X",
                href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                icon: <IconX width={15} height={15} />,
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full border border-line text-walnut transition hover:-translate-y-0.5 hover:border-pine-800 hover:bg-pine-900 hover:text-paper"
              >
                {s.icon}
              </a>
            ))}
            <button
              onClick={copyLink}
              aria-label="Havolani nusxalash"
              className="grid size-9 place-items-center rounded-full border border-line text-walnut transition hover:-translate-y-0.5 hover:border-pine-800 hover:bg-pine-900 hover:text-paper"
            >
              <IconLink width={16} height={16} />
            </button>
          </div>

          {/* Ishonch belgilari */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {[
              { icon: <IconTruck width={19} height={19} />, txt: t("trust1") },
              { icon: <IconShield width={19} height={19} />, txt: t("trust2") },
              { icon: <IconCard width={19} height={19} />, txt: t("trust3") },
              { icon: <IconRuler width={19} height={19} />, txt: t("trust4") },
            ].map((x) => (
              <div key={x.txt} className="flex items-center gap-2.5 rounded-lg border border-line bg-white/60 px-3 py-2.5 text-[12.5px] font-semibold text-ink/85">
                <span className="text-honey-600">{x.icon}</span> {x.txt}
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Tavsif + xususiyatlar */}
      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <h2 className="font-display text-2xl font-semibold">{t("desc_title")}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/85">{L(product.description)}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/85">
            {L({
              uz: "Har bir buyum ustaxonamizda qo'lda yig'iladi va jo'natishdan oldin ikki bosqichli nazoratdan o'tadi. Yetkazib berish kuni usta o'zi o'rnatib, kerak bo'lsa eshik/yo'lak o'lchamlarini oldindan hisoblab beradi.",
              ru: "Каждое изделие собирается вручную в нашей мастерской и проходит двухступенчатый контроль перед отправкой. В день доставки мастер сам устанавливает мебель и заранее рассчитывает проёмы дверей и коридоров.",
            })}
          </p>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-2">
          <h2 className="font-display text-2xl font-semibold">{t("specs")}</h2>
          <dl className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/60">
            {specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
                <dt className="font-semibold text-walnut">{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Yetkazish + ustaga savol */}
      <Reveal delay={80}>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-pine-100/60 p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300">
              <IconTruck width={21} height={21} />
            </span>
            <div>
              <h3 className="font-display text-[16.5px] font-semibold">{t("prod_delivery_t")}</h3>
              <p className="mt-0.5 text-[13.5px] text-walnut">{t("prod_delivery_d")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-line bg-honey-100/70 p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-honey-400 text-pine-950">
              <IconTelegram width={21} height={21} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold leading-snug text-ink/85">{t("prod_ask")}</p>
            </div>
            <a
              href={TG_LINK}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-pine-900 px-5 py-2.5 text-[13px] font-bold text-paper transition hover:bg-pine-800 active:scale-95"
            >
              {t("cta_tg")}
            </a>
          </div>
        </div>
      </Reveal>

      {/* O'xshash mahsulotlar */}
      <section className="mt-16">
        <Reveal className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("similar")}</h2>
          <Link to={`/katalog/${product.category}`} className="group inline-flex items-center gap-2 font-bold text-pine-800 transition hover:text-honey-600">
            {category ? L(category.name) : t("nav_catalog")} <IconArrow width={16} height={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {similar.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IMG } from "../data/images";
import { discountOf, formatPrice } from "../data/catalog";
import { useI18n } from "../lib/i18n";
import { useCart } from "../store/cart";
import { useCatalog } from "../store/catalog";
import { useToast, Reveal } from "./ui";
import { IconCart, IconCheck } from "./icons";

export function ProductCard({ product, index = 0 }) {
  const { t, L } = useI18n();
  const { add } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const timer = useRef(undefined);

  const { getCategory } = useCatalog();
  const cat = getCategory(product.category);
  const sale = discountOf(product);

  const onAdd = (e) => {
    e.preventDefault();
    add(product.id);
    toast(t("toast_added"));
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Reveal delay={(index % 4) * 70} as="article">
      <Link
        to={`/mahsulot/${product.slug}`}
        className="group block overflow-hidden rounded-xl border border-line bg-white/70 shadow-[0_2px_10px_-8px_rgb(36_29_18/0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:border-honey-400/60 hover:shadow-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <img
            src={product.imageUrl || IMG[product.image]}
            alt={L(product.name)}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
          {/* Badge'lar */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.is_new && (
              <span className="rounded-full bg-honey-400 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-pine-950">
                {t("new")}
              </span>
            )}
            {sale > 0 && (
              <span className="rounded-full bg-rust px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-paper">
                −{sale}%
              </span>
            )}
            {product.status === "on_order" && (
              <span className="rounded-full border border-pine-800/40 bg-paper/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pine-800">
                {t("on_order")}
              </span>
            )}
          </div>
          {/* Tez qo'shish tugmasi */}
          <button
            onClick={onAdd}
            aria-label={t("add_cart")}
            className={`absolute bottom-3 right-3 grid size-11 place-items-center rounded-full shadow-lift transition-all duration-300 active:scale-90 ${
              added
                ? "bg-pine-700 text-paper"
                : "bg-pine-900 text-honey-300 hover:bg-honey-400 hover:text-pine-950 max-lg:translate-y-0 lg:translate-y-14 lg:group-hover:translate-y-0"
            }`}
          >
            {added ? <IconCheck width={19} height={19} strokeWidth={2.3} /> : <IconCart width={19} height={19} />}
          </button>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-honey-600">{cat ? L(cat.name) : ""}</p>
          <h3 className="font-display mt-1 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-pine-800">
            {L(product.name)}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-walnut">{L(product.materialLabel)}</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              {product.old_price && (
                <p className="text-[12.5px] font-semibold text-walnut/70 line-through">{formatPrice(product.old_price)}</p>
              )}
              <p className="text-[17px] font-extrabold tracking-tight text-pine-900">{formatPrice(product.price)}</p>
            </div>
            <div className="flex -space-x-1 pb-1">
              {product.variants.slice(0, 4).map((v) => (
                <span
                  key={v.hex}
                  title={L(v.name)}
                  className="size-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: v.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

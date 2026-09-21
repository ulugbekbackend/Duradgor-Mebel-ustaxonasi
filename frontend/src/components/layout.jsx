import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/catalog";
import { useI18n } from "../lib/i18n";
import { useCart } from "../store/cart";
import {
  IconCart,
  IconClock,
  IconClose,
  IconFacebook,
  IconLogo,
  IconMenu,
  IconPhone,
  IconPin,
  IconSearch,
  IconTelegram,
} from "./icons";

// Andoza — haqiqiy raqam bilan almashtiring (masalan "+998 90 000 00 00" va "tel:+998900000000")
export const PHONE = "+998 XX XXX XX XX";
export const PHONE_HREF = "tel:+998";
export const TG_LINK = "https://t.me";
// Footer: sayt dasturchisi
export const DEV_NAME = "Ulug'bek";
export const DEV_URL = "https://ulugbekdev.uz";

const CATEGORIES_L = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]));

/* ---------------- Yuqori lenta + Header ---------------- */
export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(0);
  const prevCount = useRef(count);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      setBump((b) => b + 1);
    }
  }, [count]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/katalog?q=${encodeURIComponent(q.trim())}` : "/katalog");
    setQ("");
    setMenuOpen(false);
  };

  const navItem = ({ isActive }) =>
    `relative py-2 text-[15px] font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-honey-500 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      isActive ? "text-pine-800 after:scale-x-100" : "text-ink/80"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Yuqori axborot lentasi */}
      <div className="bg-pine-950 text-paper/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[12.5px] font-medium sm:px-6">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <IconClock width={14} height={14} className="text-honey-400" />
              {t("top_hours")}
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <IconPin width={14} height={14} className="text-honey-400" />
              {t("top_address")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href={PHONE_HREF} className="hidden items-center gap-1.5 font-bold tracking-wide transition hover:text-honey-300 md:flex">
              <IconPhone width={14} height={14} className="text-honey-400" />
              {PHONE}
            </a>
            <a href={TG_LINK} target="_blank" rel="noreferrer" aria-label="Telegram" className="transition hover:text-honey-300">
              <IconTelegram width={16} height={16} />
            </a>
            <div className="flex overflow-hidden rounded-full border border-paper/25 text-[11.5px] font-bold uppercase">
              {["uz", "ru"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 transition ${lang === l ? "bg-honey-400 text-pine-950" : "text-paper/70 hover:text-paper"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asosiy panel */}
      <div
        className={`border-b border-line/80 bg-paper/92 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_10px_30px_-18px_rgb(18_48_36/0.4)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            className="grid size-10 place-items-center rounded-full border border-line text-ink transition hover:bg-sand lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Menyu"
          >
            <IconMenu />
          </button>

          <Link to="/" className="group flex items-center gap-2.5">
            <IconLogo className="transition-transform duration-300 group-hover:-rotate-6" />
            <span className="leading-none">
              <span className="font-display block text-[21px] font-bold tracking-tight text-pine-900">Duradgor</span>
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.22em] text-honey-600">{t("brand_note")}</span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-7 lg:flex">
            <NavLink to="/" end className={navItem}>{t("nav_home")}</NavLink>
            <NavLink to="/katalog" className={navItem}>{t("nav_catalog")}</NavLink>
            <NavLink to="/aloqa" className={navItem}>{t("nav_contact")}</NavLink>
          </nav>

          <form onSubmit={submitSearch} className="relative ml-auto hidden w-56 md:block xl:w-72">
            <IconSearch width={16} height={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-walnut/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_ph")}
              className="w-full rounded-full border border-line bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-walnut/60 focus:border-honey-500 focus:bg-white focus:ring-2 focus:ring-honey-400/40"
            />
          </form>

          <Link
            to="/savat"
            className="relative ml-auto flex items-center gap-2.5 rounded-full bg-pine-900 py-2.5 pl-4 pr-5 text-sm font-bold text-paper shadow-card transition hover:bg-pine-800 active:scale-95 md:ml-0"
          >
            <IconCart width={18} height={18} />
            <span className="hidden sm:inline">{t("cart")}</span>
            {count > 0 && (
              <span
                key={bump}
                className="anim-bump absolute -right-1.5 -top-1.5 grid min-w-6 place-items-center rounded-full bg-honey-400 px-1.5 py-0.5 text-[11px] font-extrabold text-pine-950 ring-2 ring-paper"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobil menyu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-pine-950/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="anim-rise absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col bg-paper shadow-lift">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Link to="/" className="flex items-center gap-2.5">
                <IconLogo />
                <span className="font-display text-xl font-bold text-pine-900">Duradgor</span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center rounded-full border border-line transition hover:bg-sand"
                aria-label="Yopish"
              >
                <IconClose />
              </button>
            </div>
            <form onSubmit={submitSearch} className="relative p-4 pb-0">
              <IconSearch width={16} height={16} className="pointer-events-none absolute left-7.5 top-1/2 -translate-y-1/2 text-walnut/70" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_ph")}
                className="w-full rounded-full border border-line bg-white/70 py-3 pl-10 pr-4 text-sm outline-none focus:border-honey-500"
              />
            </form>
            <nav className="flex flex-col gap-1 p-4 text-lg">
              {[
                { to: "/", label: t("nav_home") },
                { to: "/katalog", label: t("nav_catalog") },
                { to: "/aloqa", label: t("nav_contact") },
                { to: "/savat", label: `${t("cart")} ${count ? `(${count})` : ""}` },
              ].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-semibold transition ${isActive ? "bg-pine-900 text-paper" : "hover:bg-sand"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto space-y-3 border-t border-line p-5 text-sm">
              <a href={PHONE_HREF} className="flex items-center gap-2.5 font-bold text-pine-900">
                <IconPhone className="text-honey-600" /> {PHONE}
              </a>
              <a href={TG_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 font-semibold text-walnut">
                <IconTelegram className="text-honey-600" /> Telegram
              </a>
              <p className="text-walnut/80">{t("top_hours")} · {t("top_address")}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const { t, L } = useI18n();
  const year = new Date().getFullYear();
  const cats = [
    { slug: "sofas" }, { slug: "armchairs" }, { slug: "beds" }, { slug: "wardrobes" },
    { slug: "kitchen-sets" }, { slug: "dining" }, { slug: "desks" },
  ];
  return (
    <footer className="noise relative overflow-hidden bg-pine-950 text-paper/85">
      <div className="woodlines absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <IconLogo />
            <span className="leading-none">
              <span className="font-display block text-xl font-bold text-paper">Duradgor</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-honey-400">{t("brand_note")}</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">{t("footer_about")}</p>
          <div className="mt-5 flex gap-2.5">
            {[
              { href: TG_LINK, label: "Telegram", icon: <IconTelegram width={17} height={17} /> },
              { href: "https://facebook.com", label: "Facebook", icon: <IconFacebook width={17} height={17} /> },
              { href: "https://instagram.com", label: "Instagram", icon: <IconPin width={17} height={17} /> },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid size-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition hover:-translate-y-0.5 hover:border-honey-400 hover:text-honey-300"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-paper">{t("footer_catalog")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link to={`/katalog/${c.slug}`} className="transition hover:text-honey-300">
                  {L(Object.assign({ uz: "", ru: "" }, CATEGORIES_L[c.slug]))}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-paper">{t("footer_clients")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[t("f_delivery"), t("f_warranty"), t("f_custom"), t("f_measure")].map((x) => (
              <li key={x}>
                <Link to="/aloqa" className="transition hover:text-honey-300">{x}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-paper">{t("footer_contacts")}</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={PHONE_HREF} className="flex items-center gap-2.5 font-bold text-paper transition hover:text-honey-300">
                <IconPhone width={16} height={16} className="text-honey-400" /> {PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2.5"><IconPin width={16} height={16} className="shrink-0 text-honey-400" /> {t("top_address")}</li>
            <li className="flex items-center gap-2.5"><IconClock width={16} height={16} className="shrink-0 text-honey-400" /> {t("top_hours")}</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-paper/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-paper/55 sm:flex-row sm:px-6">
          <span>© {year} Duradgor Mebel. {t("rights")}.</span>
          <span>
            {t("dev_by")}:{" "}
            <a
              href={DEV_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-paper/80 underline decoration-paper/30 underline-offset-2 transition hover:text-honey-300 hover:decoration-honey-300"
            >
              {DEV_NAME}
            </a>
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#eab64f"><path d="M12 21s-7.5-4.9-9.5-9.2C1 8 3 4.5 6.5 4.5c2 0 3.5 1.2 5.5 3.4 2-2.2 3.5-3.4 5.5-3.4C21 4.5 23 8 21.5 11.8 19.5 16.1 12 21 12 21Z"/></svg>
            {t("made_line")}
          </span>
        </div>
      </div>
    </footer>
  );
}

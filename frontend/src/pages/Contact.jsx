import { useState } from "react";
import { IMG } from "../data/images";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { PHONE, PHONE_HREF, TG_LINK } from "../components/layout";
import { Reveal, useToast } from "../components/ui";
import { IconArrow, IconCheck, IconChevron, IconClock, IconFacebook, IconPhone, IconPin, IconTelegram } from "../components/icons";

const GALLERY = ["workshop", "sofa", "dining", "bed", "wardrobe", "desk"];

export function ContactPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);

  useSEO({
    title: `${t("ct_title")} — Duradgor Mebel ustaxonasi`,
    description: "Duradgor mebel ustaxonasi bilan bog'laning: telefon, Telegram, manzil va ish vaqti. Chilonzor-9, Toshkent.",
    image: IMG.workshop,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSent(true);
    toast(t("ct_sent"));
    setName("");
    setPhone("");
    setMsg("");
    setTimeout(() => setSent(false), 2500);
  };

  const cards = [
    { icon: <IconPhone width={20} height={20} />, label: t("ct_phone"), value: PHONE, href: PHONE_HREF },
    { icon: <IconTelegram width={20} height={20} />, label: t("ct_tg"), value: "Telegram", href: TG_LINK },
    { icon: <IconPin width={20} height={20} />, label: t("ct_address"), value: t("top_address") },
    { icon: <IconClock width={20} height={20} />, label: t("ct_hours"), value: t("ct_hours_v") },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];

  return (
    <>
      {/* ============ SARLAVHA BANNERI ============ */}
      <section className="noise relative overflow-hidden bg-pine-900 text-paper">
        <div className="woodlines absolute inset-0" />
        <div className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-pine-700/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="anim-rise max-w-2xl">
            <p className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.18em] text-honey-300">
              <span className="h-px w-8 bg-honey-400" /> Duradgor
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t("ct_title")}</h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-paper/70">{t("ct_sub")}</p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2.5 rounded-full bg-honey-400 px-6 py-3 font-bold text-pine-950 shadow-lift transition hover:bg-honey-300 active:scale-95"
              >
                <IconPhone width={17} height={17} /> {t("cta_call")}
              </a>
              <a
                href={TG_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-paper/30 px-6 py-3 font-bold transition hover:border-honey-300 hover:text-honey-300 active:scale-95"
              >
                <IconTelegram width={17} height={17} /> {t("cta_tg")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Kontakt kartalari + ish vaqti + xarita */}
          <div className="space-y-4 lg:col-span-2">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 60}>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-line bg-white/70 p-5 shadow-[0_2px_12px_-10px_rgb(36_29_18/0.35)] transition hover:-translate-y-0.5 hover:border-honey-400 hover:shadow-card"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300 transition group-hover:bg-honey-400 group-hover:text-pine-950">
                      {c.icon}
                    </span>
                    <span>
                      <span className="block text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-walnut">{c.label}</span>
                      <span className="font-display block text-lg font-semibold text-ink">{c.value}</span>
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-line bg-white/70 p-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300">{c.icon}</span>
                    <span>
                      <span className="block text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-walnut">{c.label}</span>
                      <span className="font-display block text-lg font-semibold text-ink">{c.value}</span>
                    </span>
                  </div>
                )}
              </Reveal>
            ))}

            {/* Ish vaqti jadvali */}
            <Reveal delay={260}>
              <div className="overflow-hidden rounded-xl border border-line bg-white/70">
                <div className="flex items-center justify-between bg-pine-900 px-5 py-3 text-paper">
                  <span className="font-display font-semibold">{t("ct_hours")}</span>
                  <IconClock width={17} height={17} className="text-honey-300" />
                </div>
                <dl className="divide-y divide-line text-[14.5px]">
                  <div className="flex items-center justify-between px-5 py-3">
                    <dt className="font-semibold text-walnut">{t("ct_days")}</dt>
                    <dd className="font-extrabold text-pine-900">9:00 — 18:00</dd>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <dt className="font-semibold text-walnut">{t("ct_sunday")}</dt>
                    <dd className="rounded-full bg-rust/10 px-3 py-0.5 text-[12.5px] font-extrabold text-rust">{t("ct_closed")}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            {/* Xarita */}
            <Reveal delay={320}>
              <div className="relative overflow-hidden rounded-xl border border-line bg-pine-100">
                <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label="Xarita">
                  <rect width="400" height="220" fill="#dfeadf" />
                  <g stroke="#bcd4c1" strokeWidth="7" strokeLinecap="round">
                    <path d="M-10 60 H410" /><path d="M-10 130 H410" /><path d="M-10 190 H410" />
                    <path d="M70 -10 V230" /><path d="M170 -10 V230" /><path d="M300 -10 V230" />
                  </g>
                  <g stroke="#a9c4ad" strokeWidth="3.5" strokeLinecap="round">
                    <path d="M-10 95 H410" /><path d="M120 -10 V230" /><path d="M235 -10 V230" />
                  </g>
                  <rect x="252" y="66" width="38" height="26" rx="4" fill="#bcd4c1" />
                  <rect x="80" y="140" width="30" height="22" rx="4" fill="#bcd4c1" />
                  <circle cx="200" cy="105" r="26" fill="#123024" opacity="0.12" />
                  <g transform="translate(200 105)">
                    <path d="M0-22a13.5 13.5 0 0 1 13.5 13.5c0 10-13.5 24-13.5 24S-13.5 1.5-13.5-8.5A13.5 13.5 0 0 1 0-22Z" fill="#123024" />
                    <circle cy="-8.5" r="5" fill="#eab64f" />
                  </g>
                </svg>
                <p className="absolute bottom-3 left-3 rounded-full bg-pine-950/90 px-3.5 py-1.5 text-[12px] font-bold text-paper">
                  {t("ct_map")}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Forma + FAQ */}
          <div className="min-w-0 lg:col-span-3">
            <Reveal delay={120}>
              <form onSubmit={submit} className="rounded-xl border border-line bg-white/70 p-6 shadow-card sm:p-8">
                <h2 className="font-display text-2xl font-semibold">{t("ct_form_t")}</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="mb-1.5 block text-sm font-bold">{t("ct_name")} *</label>
                    <input
                      id="ct-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-honey-500 focus:ring-2 focus:ring-honey-400/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-phone" className="mb-1.5 block text-sm font-bold">{t("ct_phone")} *</label>
                    <input
                      id="ct-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+998 …"
                      className="w-full rounded-xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-honey-500 focus:ring-2 focus:ring-honey-400/40"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="ct-msg" className="mb-1.5 block text-sm font-bold">{t("ct_msg")}</label>
                  <textarea
                    id="ct-msg"
                    rows={6}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-honey-500 focus:ring-2 focus:ring-honey-400/40"
                  />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-pine-900 px-8 py-3.5 font-bold text-paper shadow-card transition hover:bg-pine-800 active:scale-95"
                  >
                    {sent ? <IconCheck width={18} height={18} strokeWidth={2.4} className="text-honey-300" /> : <IconArrow width={18} height={18} />}
                    {sent ? t("ct_sent") : t("ct_send")}
                  </button>
                  <div className="flex gap-2">
                    {[
                      { href: TG_LINK, label: "Telegram", icon: <IconTelegram width={16} height={16} /> },
                      { href: "https://facebook.com", label: "Facebook", icon: <IconFacebook width={16} height={16} /> },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="grid size-11 place-items-center rounded-full border border-line text-walnut transition hover:-translate-y-0.5 hover:border-pine-800 hover:bg-pine-900 hover:text-paper"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </form>
            </Reveal>

            {/* FAQ */}
            <Reveal delay={180}>
              <h2 className="font-display mt-10 text-2xl font-semibold">{t("faq_t")}</h2>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/60">
                {faqs.map((it, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-bold transition hover:bg-sand/50"
                      aria-expanded={faqOpen === i}
                    >
                      {it.q}
                      <IconChevron
                        width={16}
                        height={16}
                        className={`shrink-0 text-honey-600 transition-transform duration-300 ${faqOpen === i ? "rotate-90" : ""}`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${faqOpen === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-4 text-[14px] leading-relaxed text-walnut">{it.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ============ USTAXONA GALEREYASI ============ */}
      <section className="border-t border-line bg-sand/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal className="mb-7 max-w-xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">Duradgor</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("ct_gallery_t")}</h2>
            <p className="mt-2.5 text-walnut">{t("ct_gallery_d")}</p>
          </Reveal>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:-mx-6 sm:px-6">
            {GALLERY.map((key, i) => (
              <Reveal key={key} delay={i * 70} className="snap-start">
                <figure className="group relative h-64 w-56 shrink-0 overflow-hidden rounded-xl border border-line shadow-[0_2px_14px_-10px_rgb(36_29_18/0.4)] sm:w-72">
                  <img
                    src={IMG[key]}
                    alt={key}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pine-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

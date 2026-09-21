import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/catalog";
import { useI18n } from "../lib/i18n";
import { useSEO } from "../lib/seo";
import { createOrder } from "../lib/api";
import { firstError, isValidPhone } from "../lib/validators";
import { useCart, useCartLines } from "../store/cart";
import { EmptyState, LoadError, Reveal } from "../components/ui";
import { TG_LINK } from "../components/layout";
import { IconArrow, IconCheck, IconChevron, IconShield, IconTelegram, IconTruck } from "../components/icons";

/* Bosqich ko'rsatkichi: 1 Savat → 2 Ma'lumotlar → 3 Tasdiqlash */
function Steps({ current, t }) {
  const steps = [
    { k: "step_cart", done: true },
    { k: "step_info", done: current === 2 },
    { k: "step_done", done: current === 3 },
  ];
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((s, i) => {
        const active = (current === 2 && i === 1) || (current === 3 && i === 2);
        return (
          <li key={s.k} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && <span className={`h-px w-6 sm:w-12 ${s.done || active ? "bg-pine-800" : "bg-line"}`} />}
            <span className="flex items-center gap-2">
              <span
                className={`grid size-8 place-items-center rounded-full text-[13px] font-extrabold transition ${
                  active
                    ? "bg-pine-900 text-honey-300 shadow-card"
                    : s.done
                    ? "bg-pine-700 text-paper"
                    : "border-2 border-line bg-white/60 text-walnut"
                }`}
              >
                {s.done && !active ? <IconCheck width={14} height={14} strokeWidth={2.6} /> : i + 1}
              </span>
              <span className={`hidden text-[13px] font-bold sm:inline ${active ? "text-pine-900" : "text-walnut"}`}>{t(s.k)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* FAQ akkordeon */
function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);
  const items = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/60">
      {items.map((it, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-bold transition hover:bg-sand/50"
            aria-expanded={open === i}
          >
            {it.q}
            <IconChevron
              width={16}
              height={16}
              className={`shrink-0 text-honey-600 transition-transform duration-300 ${open === i ? "rotate-90" : ""}`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ease-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-[14px] leading-relaxed text-walnut">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckoutPage() {
  const { t, L } = useI18n();
  const { items, clear } = useCart();
  const { lines, total, loading: linesLoading, error: linesError, reload: reloadLines } = useCartLines();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState("cash");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useSEO({ title: `${t("co_title")} — Duradgor Mebel` });

  const validate = () => {
    const e = {};
    if (name.trim().length < 2) e.name = t("err_required");
    if (!isValidPhone(phone)) e.phone = t("err_phone");
    if (address.trim().length < 5) e.address = t("err_required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate() || lines.length === 0) return;
    setSending(true);
    try {
      const res = await createOrder({
        full_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        comment: comment.trim(),
        payment_method: payment,
        items: lines.map(({ item }) => ({
          product: item.productId,
          variant: item.variantId,
          quantity: item.qty,
        })),
      });
      setResult(res);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.status === 429) {
        setErrors({ form: t("err_throttle") });
        return;
      }
      const f = err.fields ?? {};
      setErrors({
        name: firstError(f.full_name),
        phone: firstError(f.phone),
        address: firstError(f.address),
        form: firstError(f.items) || firstError(f.detail) || (f.full_name || f.phone || f.address ? undefined : t("err_send")),
      });
    } finally {
      setSending(false);
    }
  };

  /* -------- 3-bosqich: Muvaffaqiyat ekrani -------- */
  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Reveal className="flex justify-center">
          <Steps current={3} t={t} />
        </Reveal>
        <div className="anim-check mx-auto mt-10 grid size-24 place-items-center rounded-full bg-pine-900 shadow-lift">
          <IconCheck width={44} height={44} strokeWidth={2.4} className="text-honey-300" />
        </div>
        <h1 className="font-display mt-7 text-3xl font-semibold sm:text-4xl">{t("ok_title")}</h1>
        <p className="mt-3 text-walnut">{t("ok_text")}</p>
        <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-honey-500 bg-honey-100/60 px-6 py-3.5">
          <span className="text-sm font-bold text-walnut">{t("ok_num")}:</span>
          <span className="font-display text-2xl font-bold tracking-wide text-pine-900">{result.order_number}</span>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-7 py-3.5 font-bold text-paper transition hover:bg-pine-800 active:scale-95"
          >
            {t("ok_home")} <IconArrow width={17} height={17} />
          </Link>
          <a
            href={TG_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-pine-900 px-7 py-3.5 font-bold text-pine-900 transition hover:bg-pine-900 hover:text-paper"
          >
            <IconTelegram width={17} height={17} /> Telegram
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <EmptyState title={t("cart_empty_t")} text={t("cart_empty_p")}>
          <Link to="/katalog" className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-7 py-3.5 font-bold text-paper transition hover:bg-pine-800">
            {t("to_catalog")} <IconArrow width={17} height={17} />
          </Link>
        </EmptyState>
      </div>
    );
  }

  const inputCls = (err) =>
    `w-full rounded-xl border bg-white/80 px-4 py-3 text-[15px] outline-none transition placeholder:text-walnut/50 focus:ring-2 ${
      err ? "border-rust focus:border-rust focus:ring-rust/30" : "border-line focus:border-honey-500 focus:ring-honey-400/40"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Reveal className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-honey-600">Duradgor</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t("co_title")}</h1>
          <p className="mt-2.5 text-walnut">{t("co_sub")}</p>
        </div>
        <Steps current={2} t={t} />
      </Reveal>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Reveal>
            <form onSubmit={submit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-name" className="mb-1.5 block text-sm font-bold">{t("co_name")} *</label>
                  <input id="co-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("co_name_ph")} className={inputCls(errors.name)} />
                  {errors.name && <p className="mt-1.5 text-[12.5px] font-semibold text-rust">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="co-phone" className="mb-1.5 block text-sm font-bold">{t("co_phone")} *</label>
                  <input id="co-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("co_phone_ph")} className={inputCls(errors.phone)} />
                  {errors.phone && <p className="mt-1.5 text-[12.5px] font-semibold text-rust">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="co-addr" className="mb-1.5 block text-sm font-bold">{t("co_address")} *</label>
                <input id="co-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("co_address_ph")} className={inputCls(errors.address)} />
                {errors.address && <p className="mt-1.5 text-[12.5px] font-semibold text-rust">{errors.address}</p>}
              </div>
              <div>
                <label htmlFor="co-comment" className="mb-1.5 block text-sm font-bold">{t("co_comment")}</label>
                <textarea id="co-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("co_comment_ph")} className={inputCls()} />
              </div>

              <fieldset>
                <legend className="mb-2.5 text-sm font-bold">{t("co_payment")}</legend>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { v: "cash", label: t("pay_cash") },
                    { v: "online", label: t("pay_online") },
                    { v: "terminal", label: t("pay_terminal") },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-[13.5px] font-bold transition ${
                        payment === o.v
                          ? "border-pine-800 bg-pine-900 text-paper shadow-card"
                          : "border-line bg-white/70 text-walnut hover:border-honey-500"
                      }`}
                    >
                      <input type="radio" name="payment" className="sr-only" checked={payment === o.v} onChange={() => setPayment(o.v)} />
                      {o.label}
                    </label>
                  ))}
                </div>
                <p className="mt-2.5 rounded-lg bg-honey-100/70 px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed text-honey-700">
                  {t("pay_note")}
                </p>
              </fieldset>

              {errors.form && (
                <p role="alert" className="rounded-lg bg-rust/10 px-3.5 py-2.5 text-[13px] font-semibold text-rust">
                  {errors.form}
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-honey-400 py-4 text-[16px] font-bold text-pine-950 shadow-card transition hover:bg-honey-300 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                {sending ? (
                  <span className="size-5 animate-spin rounded-full border-[3px] border-pine-950/30 border-t-pine-950" />
                ) : (
                  <IconCheck width={19} height={19} strokeWidth={2.2} />
                )}
                {t("co_confirm")}
              </button>
              <p className="text-center text-[12.5px] text-walnut/85">{t("co_send_note")}</p>
            </form>
          </Reveal>

          {/* Yetkazish ma'lumoti + kafolat */}
          <Reveal delay={100}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3.5 rounded-xl border border-line bg-pine-100/60 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300">
                  <IconTruck width={20} height={20} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-semibold">{t("co_delivery_t")}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-walnut">{t("co_delivery_d")}</p>
                </div>
              </div>
              <div className="flex gap-3.5 rounded-xl border border-line bg-pine-100/60 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pine-900 text-honey-300">
                  <IconShield width={20} height={20} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-semibold">{t("trust2")}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-walnut">{t("faq3a")}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal delay={150}>
            <h2 className="font-display mt-10 text-2xl font-semibold">{t("faq_t")}</h2>
            <div className="mt-4">
              <Faq />
            </div>
          </Reveal>
        </div>

        {/* Buyurtma tarkibi */}
        <Reveal delay={120}>
          <aside className="sticky top-32 rounded-xl border border-line bg-white/70 p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">{t("co_your")}</h2>
            {linesError && <LoadError onRetry={reloadLines} />}
            <ul className="mt-5 space-y-4">
              {linesLoading && <li className="h-14 animate-pulse rounded-lg bg-sand/70" />}
              {lines.map(({ item, product: p, variant: v, unitPrice, lineTotal }) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                  <img src={p.imageUrl} alt="" className="size-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold">{L(p.name)}</p>
                    <p className="text-[12.5px] text-walnut">
                      {v ? `${L(v.name)} · ` : ""}
                      {item.qty} × {formatPrice(unitPrice)}
                    </p>
                  </div>
                  <p className="text-[14px] font-extrabold">{formatPrice(lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-walnut">{t("delivery")}</dt>
                <dd className="font-bold text-pine-700">{t("free")}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="font-bold">{t("grand")}</dt>
                <dd className="font-display text-2xl font-bold text-pine-900">{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-walnut/85">
              <IconCheck width={14} height={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-pine-700" />
              {t("co_send_note")}
            </p>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}

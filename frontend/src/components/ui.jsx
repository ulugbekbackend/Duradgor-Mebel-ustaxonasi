import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import { IconCheck, IconMinus, IconPlus } from "./icons";

/* ---------------- Scroll reveal ---------------- */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag ref={ref} style={style} className={`reveal ${inView ? "is-in" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((text) => {
    const id = ++idRef.current;
    setToasts((p) => [...p.slice(-2), { id, text }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast pointer-events-auto flex items-center gap-2.5 rounded-full bg-pine-900 py-2.5 pl-3 pr-5 text-sm font-semibold text-paper shadow-lift ring-1 ring-honey-400/30"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-honey-400 text-pine-950">
              <IconCheck width={14} height={14} strokeWidth={2.4} />
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast ToastProvider ichida chaqirilishi kerak");
  return ctx;
}

/* ---------------- Qty stepper ---------------- */
export function QtyStepper({ value, onChange, max = 20, small = false }) {
  const btn = small ? "size-8" : "size-10";
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white/70">
      <button
        type="button"
        aria-label="Kamaytirish"
        onClick={() => onChange(Math.max(1, value - 1))}
        className={`${btn} grid place-items-center rounded-full text-walnut transition hover:bg-sand active:scale-90`}
      >
        <IconMinus width={15} height={15} />
      </button>
      <span className={`${small ? "w-8" : "w-10"} text-center font-bold tabular-nums`}>{value}</span>
      <button
        type="button"
        aria-label="Ko'paytirish"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`${btn} grid place-items-center rounded-full text-walnut transition hover:bg-sand active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent`}
      >
        <IconPlus width={15} height={15} />
      </button>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white/60">
      <div className="aspect-[4/5] animate-pulse bg-sand" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-sand" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-sand" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-sand" />
      </div>
    </div>
  );
}

/* ---------------- Bo'sh holat ---------------- */
export function EmptyState({ title, text, children }) {
  return (
    <div className="anim-rise mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-line">
        <path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11" />
        <path d="M3.5 13.5A2 2 0 0 1 5.5 11c1.1 0 2 .9 2 2v.5h9v-.5a2 2 0 1 1 4 0v2.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-2ZM6.5 17.5V19M17.5 17.5V19" />
      </svg>
      <h3 className="font-display mt-4 text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-walnut">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

/* ---------------- Yuklash xatosi (qayta urinish bilan) ---------------- */
export function LoadError({ onRetry }) {
  const { t } = useI18n();
  return (
    <EmptyState title={t("load_err_t")} text={t("load_err_p")}>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-3 font-bold text-paper transition hover:bg-pine-800 active:scale-95"
        >
          {t("retry")}
        </button>
      )}
    </EmptyState>
  );
}

/* ---------------- Yulduzlar ---------------- */
export function Stars({ n = 5 }) {
  return (
    <span className="inline-flex gap-0.5 text-honey-500">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.6 14.9 8.7l6.5.8-4.8 4.5 1.3 6.4L12 17.2l-5.9 3.2 1.3-6.4L2.6 9.5l6.5-.8L12 2.6Z" />
        </svg>
      ))}
    </span>
  );
}

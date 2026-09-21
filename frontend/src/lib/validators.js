/** Backend (core/validators.py) bilan bir xil qoidalar. */

// Faqat raqam, bo'shliq, "-", "()" va boshida "+"; raqamlar soni 9–15
export const isValidPhone = (value) => {
  const v = value.trim();
  const digits = v.replace(/\D/g, "").length;
  return /^\+?[\d\s\-()]+$/.test(v) && digits >= 9 && digits <= 15;
};

/** DRF xatolari ichma-ich keladi: ["..."], { "0": { variant: ["..."] } } — birinchi matnni oladi. */
export const firstError = (v) => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    for (const x of Object.values(v)) {
      const m = firstError(x);
      if (m) return m;
    }
  }
  return undefined;
};

import { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { I18nProvider, useI18n } from "./lib/i18n";
import { CartProvider } from "./store/cart";
import { ToastProvider } from "./components/ui";
import { Footer, Header } from "./components/layout";
import { HomePage } from "./pages/Home";
import { CategoryPage } from "./pages/Category";
import { ProductPage } from "./pages/Product";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/Checkout";
import { ContactPage } from "./pages/Contact";
import { useSEO } from "./lib/seo";
import { IconArrow } from "./components/icons";

function ScrollToTop() {
  const { pathname } = useLocation();
  // Qavs shart: yangi brauzerlarda scrollTo Promise qaytaradi — effekt uni qaytarsa,
  // React uni tozalash funksiyasi deb chaqiradi va butun ilova yiqiladi (oq ekran)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function NotFound() {
  const { t } = useI18n();
  useSEO({ title: "404 — Duradgor Mebel" });
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-[96px] font-bold leading-none text-pine-900/15">404</p>
      <h1 className="font-display -mt-6 text-3xl font-bold">{t("not_found_t")}</h1>
      <p className="mt-3 text-walnut">{t("not_found_p")}</p>
      <Link
        to="/katalog"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-3 font-bold text-paper transition hover:bg-pine-800 active:scale-95"
      >
        {t("nav_catalog")} <IconArrow width={17} height={17} />
      </Link>
    </div>
  );
}

function Shell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<CategoryPage />} />
          <Route path="/katalog/:slug" element={<CategoryPage />} />
          <Route path="/mahsulot/:slug" element={<ProductPage />} />
          <Route path="/savat" element={<CartPage />} />
          <Route path="/buyurtma" element={<CheckoutPage />} />
          <Route path="/aloqa" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Shell />
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

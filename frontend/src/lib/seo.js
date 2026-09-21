import { useEffect } from "react";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sahifa darajasidagi SEO: title, description, Open Graph. */
export function useSEO({ title, description, image }) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    setMeta("property", "og:title", title);
    if (image) setMeta("property", "og:image", image);
  }, [title, description, image]);
}

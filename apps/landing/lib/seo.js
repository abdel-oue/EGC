import { defaultLocale, locales } from "@/lib/i18n";

// Canonical + hreflang links for a page. path: "" for home, "/events", …
export function alternates(locale, path) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}

import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

// Add every public route here (see CLAUDE.md "Site map").
const routes = [""];

export default function sitemap() {
  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${route}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${route}`])) },
    }))
  );
}

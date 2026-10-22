import { locales } from "@/lib/i18n";
import { games, siteUrl } from "@/lib/site";

// Every public route (see CLAUDE.md "Site map").
const routes = [
  "",
  "/events",
  "/teams",
  ...games.filter((g) => g.registration).map((g) => `/teams/register/${g.key}`),
  "/members",
  "/gallery",
  "/join",
  "/contact",
];

export default function sitemap() {
  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${route}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${route}`])) },
    }))
  );
}

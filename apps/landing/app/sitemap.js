import { locales } from "@/lib/i18n";
import { games, siteUrl } from "@/lib/site";
import { getContent } from "@/lib/content";

export default async function sitemap() {
  const { rows } = await getContent("events");
  const routes = [
    "", "/events", "/members", "/gallery", "/join", "/contact",
    ...games.map((game) => `/games/${game.key}`),
    ...rows.map((event) => `/events/${event.slug}`),
  ];

  return routes.flatMap((route) => locales.map((locale) => ({
    url: `${siteUrl}/${locale}${route}`,
    alternates: {
      languages: Object.fromEntries(locales.map((language) => [language, `${siteUrl}/${language}${route}`])),
    },
  })));
}

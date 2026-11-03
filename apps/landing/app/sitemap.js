import { locales } from "@/lib/i18n";
import { games, siteUrl } from "@/lib/site";
import { getContent } from "@/lib/content";

export default async function sitemap() {
  const { rows } = await getContent("events");
  const { rows: forms } = await getContent("forms");
  const routes = [
    "", "/events", "/members", "/gallery", "/forms", "/join", "/contact",
    ...games.map((game) => `/games/${game.key}`),
    ...rows.map((event) => `/events/${event.slug}`),
    ...forms.map((form) => `/forms/${form.slug}`),
  ];

  return routes.flatMap((route) => locales.map((locale) => ({
    url: `${siteUrl}/${locale}${route}`,
    alternates: {
      languages: Object.fromEntries(locales.map((language) => [language, `${siteUrl}/${language}${route}`])),
    },
  })));
}

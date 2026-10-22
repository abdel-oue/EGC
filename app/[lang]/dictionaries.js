import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n";

const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export const hasLocale = (locale) => locales.includes(locale);

export async function getDictionary() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
}

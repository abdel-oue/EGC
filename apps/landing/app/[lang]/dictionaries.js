import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n";

const dictionaries = {
  fr: () => import("@egc/shared/dictionaries/fr.json").then((module) => module.default),
  en: () => import("@egc/shared/dictionaries/en.json").then((module) => module.default),
};

export const hasLocale = (locale) => locales.includes(locale);

export async function getDictionary() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
}

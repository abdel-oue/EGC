export const locales = ["fr", "en"];
export const defaultLocale = "fr";

export function localized(row, field, locale) {
  return row[`${field}_${locale}`] || row[`${field}_fr`] || "";
}

export function eventDate(value, locale = "fr") {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-MA" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
}

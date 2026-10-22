"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n";

// Links to the same page in each locale.
export default function LangSwitch({ label, className = "" }) {
  const pathname = usePathname();
  const [, current, ...rest] = pathname.split("/");

  return (
    <nav aria-label={label} className={`flex gap-1 font-display text-sm font-bold ${className}`}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${[locale, ...rest].join("/")}`}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          className="chamfer-sm px-3 py-2 uppercase transition-colors aria-[current]:bg-accent aria-[current]:text-offwhite hover:bg-night/10 aria-[current]:hover:bg-accent"
        >
          {locale}
        </Link>
      ))}
    </nav>
  );
}

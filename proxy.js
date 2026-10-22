import { NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const preferred = (request.headers.get("accept-language") || "")
    .split(",")
    .map((part) => part.trim().slice(0, 2).toLowerCase())
    .find((code) => locales.includes(code));

  request.nextUrl.pathname = `/${preferred || defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, icons, sitemap.xml…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

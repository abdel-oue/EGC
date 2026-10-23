import localFont from "next/font/local";
import { Suspense } from "react";
import { lang } from "next/root-params";
import Footer from "@/components/Footer";
import LangSwitch from "@/components/LangSwitch";
import HudButton from "@/components/HudButton";
import Sidebar from "@/components/Sidebar";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { getDictionary } from "./dictionaries";
import "../globals.css";

const inter = localFont({
  src: "../../../../packages/shared/fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "../../../../packages/shared/fonts/SpaceGrotesk.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: "%s | EGC" },
    description: dict.meta.description,
    openGraph: { siteName: "ESISA Gaming Club", locale: await lang(), type: "website" },
  };
}

export default async function RootLayout({ children }) {
  const locale = await lang();
  const dict = await getDictionary();

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div className="hidden w-64 lg:block" />}>
          <Sidebar lang={locale} dict={dict} />
        </Suspense>
        {/* overflow-x-clip: elements waiting to slide in from the side must not widen the page.
            Use clip, never hidden — hidden containers can still be scrolled sideways by the browser. */}
        <div className="relative overflow-x-clip lg:pl-64">
          <div className="absolute right-0 top-0 z-30 hidden items-center gap-4 px-12 py-6 lg:flex">
            <Suspense fallback={null}>
              <LangSwitch label={dict.nav.language} />
            </Suspense>
            <HudButton href={`/${locale}/join`} className="px-5 py-3">
              {dict.cta.join}
            </HudButton>
          </div>
          <Suspense fallback={<div className="min-h-96" aria-busy="true" />}>
            {children}
          </Suspense>
          <Footer dict={dict} />
        </div>
      </body>
    </html>
  );
}

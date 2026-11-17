import localFont from "next/font/local";
import { Suspense } from "react";
import { lang } from "next/root-params";
import Footer from "@/components/Footer";
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

const anton = localFont({
  src: "../../public/fonts/Anton-Regular.ttf",
  variable: "--font-anton",
  weight: "400",
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
    openGraph: {
      siteName: "ESISA Gaming Club",
      locale: await lang(),
      type: "website",
    },
  };
}

export default async function RootLayout({ children }) {
  const locale = await lang();
  const dict = await getDictionary();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${anton.variable} antialiased`}
    >
      <body id="top" className="egc-theme font-sans">
        <Suspense
          fallback={<div className="nav-placeholder" aria-hidden="true" />}
        >
          <Sidebar lang={locale} dict={dict} />
        </Suspense>
        {/* overflow-x-clip: elements waiting to slide in from the side must not widen the page.
            Use clip, never hidden — hidden containers can still be scrolled sideways by the browser. */}
        <div id="main-content" className="site-content" tabIndex={-1}>
          <Suspense fallback={<div className="min-h-96" aria-busy="true" />}>
            {children}
          </Suspense>
          <Suspense fallback={null}>
            <Footer dict={dict} />
          </Suspense>
        </div>
      </body>
    </html>
  );
}

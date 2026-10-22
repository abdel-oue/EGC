import { Inter, Space_Grotesk } from "next/font/google";
import { lang } from "next/root-params";
import Footer from "@/components/Footer";
import LangSwitch from "@/components/LangSwitch";
import HudButton from "@/components/HudButton";
import Sidebar from "@/components/Sidebar";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { getDictionary } from "./dictionaries";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
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
        <Sidebar lang={locale} dict={dict} />
        {/* overflow-x-clip: elements waiting to slide in from the side must not widen the page.
            Use clip, never hidden — hidden containers can still be scrolled sideways by the browser. */}
        <div className="relative overflow-x-clip lg:pl-64">
          <div className="absolute right-0 top-0 z-30 hidden items-center gap-4 px-12 py-6 lg:flex">
            <LangSwitch label={dict.nav.language} />
            <HudButton href={`/${locale}/join`} className="px-5 py-3">
              {dict.cta.join}
            </HudButton>
          </div>
          {children}
          <Footer dict={dict} />
        </div>
      </body>
    </html>
  );
}

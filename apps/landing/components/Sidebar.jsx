import Image from "next/image";
import Link from "@/components/Link";
import LangSwitch from "@/components/LangSwitch";
import NavLinks from "@/components/NavLinks";
import Socials from "@/components/Socials";

const pages = ["events", "members", "gallery", "join", "contact"];

// Fixed sidebar on desktop, sticky top bar with a <details> menu on mobile.
export default function Sidebar({ lang, dict }) {
  const links = [
    { href: `/${lang}`, label: dict.nav.home },
    ...pages.map((page) => ({ href: `/${lang}/${page}`, label: dict.nav[page] })),
  ];

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-night text-offwhite lg:flex">
        <Link href={`/${lang}`} className="block border-b border-offwhite/10 px-6 py-6">
          <Image src="/brand/logo-full.svg" alt="ESISA Gaming Club" width={200} height={83} priority className="h-auto w-full" />
        </Link>
        <nav aria-label={dict.nav.label} className="flex-1 py-4">
          <NavLinks links={links} variant="desktop" />
        </nav>
        <div className="px-6 pb-8">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-offwhite/30">{dict.nav.follow}</p>
          <Socials />
        </div>
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-night px-4 py-3 text-offwhite lg:hidden">
        <Link href={`/${lang}`} aria-label="ESISA Gaming Club">
          <Image src="/brand/logo-icon.svg" alt="" width={40} height={40} priority />
        </Link>
        <div className="flex items-center gap-2">
          <LangSwitch label={dict.nav.language} className="text-offwhite" />
          <details className="group">
            <summary className="chamfer-sm cursor-pointer list-none bg-accent px-4 py-2 font-display text-sm font-bold uppercase [&::-webkit-details-marker]:hidden">
              {dict.nav.menu}
            </summary>
            <nav aria-label={dict.nav.label} className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto bg-night shadow-xl">
              <NavLinks links={links} variant="mobile" />
              <Socials className="px-6 py-4" />
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}

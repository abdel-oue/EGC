import Image from "next/image";
import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import Socials from "@/components/Socials";

const sections = ["home", "games", "about", "join", "season", "faq"];
// Literal class names so Tailwind generates them.
const stagger = ["intro-1", "intro-2", "intro-3", "intro-4", "intro-5", "intro-6"];

// Fixed sidebar on desktop, sticky top bar with a <details> menu on mobile.
export default function Sidebar({ lang, dict }) {
  const links = sections.map((id) => ({ href: `/${lang}#${id}`, label: dict.nav[id] }));

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-night text-offwhite lg:flex">
        <Link href={`/${lang}`} className="block border-b border-offwhite/10 px-6 py-6">
          <Image src="/brand/logo-full.svg" alt="ESISA Gaming Club" width={200} height={83} priority className="h-auto w-full" />
        </Link>
        <nav aria-label={dict.nav.label} className="flex-1 py-4">
          <ul>
            {links.map((link, i) => (
              <li key={link.href} className={`intro ${stagger[i]}`}>
                <a
                  href={link.href}
                  className="group flex items-center gap-4 border-b border-offwhite/5 px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-offwhite/70 transition-all duration-300 hover:bg-offwhite/5 hover:pl-8 hover:text-offwhite"
                >
                  <span className="h-px w-4 bg-accent transition-all duration-300 group-hover:w-8" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
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
            <nav aria-label={dict.nav.label} className="absolute inset-x-0 top-full bg-night shadow-xl">
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="block border-t border-offwhite/10 px-6 py-4 font-display font-bold uppercase tracking-wider hover:bg-offwhite/5 hover:text-accent">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <Socials className="px-6 py-4" />
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}

import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import NavLinks from "@/components/NavLinks";
import HomeLink from "@/components/HomeLink";
import { Arrow, Wordmark } from "./Editorial";
import { editorial } from "./editorial-copy";
export default function Sidebar({ lang, dict }) {
  const t = editorial(lang);
  const links = [
    { href: `/${lang}#top`, label: t.club },
    { href: `/${lang}/games`, label: t.games },
    { href: `/${lang}/events`, label: t.events },
    { href: `/${lang}/members`, label: t.members },
  ];
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <div className="announcement">
        <span>ESISA Gaming Club · Fès</span>
        <LangSwitch label={dict.nav.language} className="locale-switch" />
      </div>
      <header className="site-header">
        <div className="nav-inner site-width">
          <HomeLink locale={lang}>
            <Wordmark />
          </HomeLink>
          <nav className="desktop-nav" aria-label={dict.nav.label}>
            <NavLinks links={links} variant="desktop" />
          </nav>
          <div className="nav-actions">
            <Link className="pill nav-join" href={`/${lang}/join`}>
              {t.join}
              <Arrow />
            </Link>
            <details className="mobile-menu">
              <summary aria-label={dict.nav.menu}>
                <svg
                  className="state-icon menu-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 8h16M4 16h16" />
                </svg>
                <span className="sr-only">{dict.nav.menu}</span>
              </summary>
              <nav className="mobile-nav" aria-label={dict.nav.label}>
                <NavLinks links={links} variant="mobile" />
                <Link href={`/${lang}/join`} className="mobile-join">
                  {t.join}
                  <Arrow />
                </Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

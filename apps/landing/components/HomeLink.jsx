"use client";

import Link from "next/link";

export default function HomeLink({ locale, children }) {
  const home = `/${locale}`;

  function returnToTop(event) {
    if (window.location.pathname !== home) return;
    event.preventDefault();
    window.history.replaceState(null, "", `${home}#top`);
    window.scrollTo({ top: 0, left: 0 });
  }

  return (
    <Link
      href={`${home}#top`}
      onNavigate={returnToTop}
      aria-label="ESISA Gaming Club"
      className="brand-link"
    >
      {children}
    </Link>
  );
}

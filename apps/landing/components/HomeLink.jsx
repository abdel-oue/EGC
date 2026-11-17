"use client";

import Link from "next/link";

export function returnToHomeTop(event, home) {
  if (window.location.pathname !== home) return;
  event.preventDefault();
  window.history.replaceState(null, "", `${home}#top`);
  window.scrollTo({ top: 0, left: 0 });
}

export default function HomeLink({ locale, children }) {
  const home = `/${locale}`;

  return (
    <Link
      href={`${home}#top`}
      onNavigate={(event) => returnToHomeTop(event, home)}
      aria-label="ESISA Gaming Club"
      className="brand-link"
    >
      {children}
    </Link>
  );
}

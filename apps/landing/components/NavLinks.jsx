"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { returnToHomeTop } from "./HomeLink";
export default function NavLinks({ links, variant }) {
  const pathname = usePathname();
  const close = (event) =>
    event.currentTarget.closest("details")?.removeAttribute("open");
  return (
    <ul className={`nav-links nav-links-${variant}`}>
      {links.map((link) => {
        const route = link.href.split("#")[0];
        const home = link.href.endsWith("#top");
        const active = home
          ? pathname === route
          : !link.href.includes("#") &&
            (pathname === route || pathname.startsWith(`${route}/`));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={variant === "mobile" ? close : undefined}
              onNavigate={
                home ? (event) => returnToHomeTop(event, route) : undefined
              }
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

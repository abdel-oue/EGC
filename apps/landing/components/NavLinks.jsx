"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function NavLinks({ links, variant }) {
  const pathname = usePathname();
  const close = (event) =>
    event.currentTarget.closest("details")?.removeAttribute("open");
  return (
    <ul className={`nav-links nav-links-${variant}`}>
      {links.map((link) => {
        const route = link.href.split("#")[0];
        const active =
          !link.href.includes("#") &&
          (pathname === route || pathname.startsWith(`${route}/`));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={variant === "mobile" ? close : undefined}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";

// Literal class names so Tailwind generates them.
const stagger = ["intro-1", "intro-2", "intro-3", "intro-4", "intro-5", "intro-6", "intro-7"];

const styles = {
  desktop:
    "group flex items-center gap-4 border-b border-offwhite/5 px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-offwhite/70 transition-all duration-300 hover:bg-offwhite/5 hover:pl-8 hover:text-offwhite aria-[current=page]:bg-offwhite/5 aria-[current=page]:text-offwhite",
  mobile:
    "block border-t border-offwhite/10 px-6 py-4 font-display font-bold uppercase tracking-wider hover:bg-offwhite/5 hover:text-accent aria-[current=page]:text-accent",
};

// links: [{ href, label }]. The first link (home) only matches exactly.
export default function NavLinks({ links, variant }) {
  const pathname = usePathname();
  const isActive = (href, i) => (i === 0 ? pathname === href : pathname.startsWith(href));
  // Close the mobile <details> menu after picking a page.
  const close = (e) => e.currentTarget.closest("details")?.removeAttribute("open");

  return (
    <ul>
      {links.map((link, i) => (
        <li key={link.href} className={variant === "desktop" ? `intro ${stagger[i]}` : undefined}>
          <Link
            href={link.href}
            aria-current={isActive(link.href, i) ? "page" : undefined}
            onClick={variant === "mobile" ? close : undefined}
            className={styles[variant]}
          >
            {variant === "desktop" && (
              <span className="h-px w-4 bg-accent transition-all duration-300 group-hover:w-8 group-aria-[current=page]:w-8" />
            )}
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

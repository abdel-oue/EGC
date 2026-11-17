"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffNav({ links, label }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="admin-navigation">
      <ul className="admin-nav">
        {links.map(({ href, label: text }) => {
          const active = pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined}>
                {text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

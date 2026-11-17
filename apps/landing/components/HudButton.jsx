import Link from "next/link";
import { Arrow } from "./Editorial";
export default function HudButton({
  href,
  variant = "accent",
  className = "",
  children,
}) {
  return (
    <Link href={href} className={`pill pill-${variant} ${className}`}>
      {children}
      <Arrow />
    </Link>
  );
}

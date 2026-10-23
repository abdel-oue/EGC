import { socials } from "@/lib/site";

const tile = "chamfer-sm grid size-11 place-items-center transition-all duration-300 hover:-translate-y-1";

export default function Socials({ className = "", tileClass = "bg-graphite text-offwhite hover:bg-accent" }) {
  return (
    <ul className={`flex gap-2 ${className}`}>
      <li>
        <a href={socials.instagram} aria-label="Instagram" className={`${tile} ${tileClass}`}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </li>
      <li>
        <a href={socials.discord} aria-label="Discord" className={`${tile} ${tileClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny decorative brand icon */}
          <img src="/brand/games/discord.svg" alt="" className="size-7" />
        </a>
      </li>
      <li>
        <a href={socials.linkedin} aria-label="LinkedIn" className={`${tile} ${tileClass}`}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
          </svg>
        </a>
      </li>
    </ul>
  );
}

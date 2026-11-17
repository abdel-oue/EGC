import Image from "next/image";
import Link from "next/link";
import { socials } from "@/lib/site";
import GamesTicker from "./GamesTicker";
import { editorial } from "./editorial-copy";

export function Arrow({ down = false, className = "" }) {
  return (
    <svg
      className={`arrow-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d={down ? "M12 4v16m-6-6 6 6 6-6" : "M5 19 19 5M5 5h14v14"} />
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark" aria-hidden="true">
      EGC<span>.</span>
    </span>
  );
}
export function PageIntro({
  eyebrow,
  lines,
  intro,
  accessibleTitle,
  className = "",
}) {
  return (
    <header className={`page-intro site-width ${className}`}>
      <span className="fading-circle" aria-hidden="true" />
      <span className="crosshair" aria-hidden="true" />
      <div className="page-intro-title intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display" aria-label={accessibleTitle || lines.join(" ")}>
          {lines.map((line, index) => (
            <span key={line} className={index ? "accent" : undefined}>
              {line}
            </span>
          ))}
        </h1>
      </div>
      {intro && (
        <div className="page-intro-copy intro intro-2">
          <span className="accent-rule" />
          <p>{intro}</p>
        </div>
      )}
    </header>
  );
}
export function GamesBand({ locale = "fr", label = false }) {
  return <GamesTicker locale={locale} label={label} />;
}
export function ClubCta({ locale = "fr", gamesPage = false }) {
  const t = editorial(locale);
  return (
    <section className="club-cta site-width">
      <span className="eyebrow">{t.club}</span>
      <h2 className="display">{gamesPage ? t.gamesCta : t.teamCta}</h2>
      <Link className="pill" href={`/${locale}/join`}>
        {t.joinClub}
        <Arrow />
      </Link>
    </section>
  );
}
export function DiscordPanel({ locale = "fr" }) {
  const t = editorial(locale);
  return (
    <section
      className="discord-panel feature-panel site-width"
      aria-label={t.joinDiscord}
    >
      <div className="feature-copy">
        <p className="eyebrow accent">{t.firstStep}</p>
        <h2 className="display">
          {t.discordLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <p className="feature-description">{t.discordIntro}</p>
        <a
          href={socials.discord}
          className="pill"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.joinDiscord}
          <Arrow />
        </a>
      </div>
      <div className="feature-art discord-art" aria-hidden="true">
        <Image
          src="/design/discord.webp"
          alt=""
          fill
          sizes="(max-width: 700px) 90vw, 50vw"
          className="object-contain"
        />
      </div>
    </section>
  );
}

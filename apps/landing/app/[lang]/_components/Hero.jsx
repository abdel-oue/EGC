import Image from "next/image";
import Link from "next/link";
import { Arrow, GamesBand } from "@/components/Editorial";
import GameCards from "@/components/GameCards";
import { editorial } from "@/components/editorial-copy";

export default function Hero({ lang }) {
  const t = editorial(lang);
  return (
    <>
      <section id="home" className="home-hero site-width">
        <span className="home-disk" aria-hidden="true" />
        <span className="crosshair" aria-hidden="true" />
        <div className="home-heading intro">
          <p className="eyebrow">{t.homeEyebrow}</p>
          <h1 className="display" aria-label={t.homeLines.join(" ")}>
            <span>{t.homeLines[0]}</span>
            <span className="accent">{t.homeLines[1]}</span>
          </h1>
        </div>
        <div className="hero-controller animate-drift" aria-hidden="true">
          <Image
            src="/design/controller.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 700px) 95vw, 62vw"
            className="object-contain"
          />
        </div>
        <div className="hero-values eyebrow" aria-hidden="true">
          {t.values.map((value) => (
            <span key={value}>{value} /</span>
          ))}
        </div>
        <div className="home-actions intro intro-3">
          <p>{t.homeTagline}</p>
          <div>
            <Link className="pill" href={`/${lang}/join`}>
              {t.joinClub}
              <Arrow />
            </Link>
            <Link className="text-link" href="#games">
              {t.discoverGames}
              <Arrow down />
            </Link>
          </div>
        </div>
      </section>
      <GamesBand locale={lang} label />
      <section id="games" className="home-games site-width">
        <div className="section-heading">
          <p className="eyebrow">01 / {t.games}</p>
          <h2 className="display">{t.gamesSection}</h2>
          <Link href={`/${lang}/games`} className="text-link">
            {t.games}
            <Arrow />
          </Link>
        </div>
        <GameCards locale={lang} compact />
      </section>
    </>
  );
}

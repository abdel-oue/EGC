import { lang } from "next/root-params";
import GameCards from "@/components/GameCards";
import { PageIntro, ClubCta, GamesBand } from "@/components/Editorial";
import { editorial } from "@/components/editorial-copy";
import { alternates } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await lang();
  const t = editorial(locale);
  return {
    title: t.games,
    description: t.gamesIntro,
    alternates: alternates(locale, "/games"),
  };
}
export default async function GamesPage() {
  const locale = await lang();
  const t = editorial(locale);
  return (
    <main className="games-page">
      <PageIntro
        eyebrow={t.gamesEyebrow}
        lines={t.gamesLines}
        intro={t.gamesIntro}
      />
      <section className="site-width game-showcase" aria-label={t.games}>
        <GameCards locale={locale} />
        <p className="more-games-note">
          <span aria-hidden="true">+</span>
          {t.moreGames}
        </p>
      </section>
      <ClubCta locale={locale} gamesPage />
      <GamesBand locale={locale} />
    </main>
  );
}

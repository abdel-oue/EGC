import Link from "next/link";
import { games } from "@/lib/site";
import { Arrow } from "./Editorial";
import { editorial } from "./editorial-copy";
export default function GameCards({ locale = "fr", compact = false }) {
  const t = editorial(locale);
  return (
    <div className={`game-grid ${compact ? "game-grid-compact" : ""}`}>
      {games.map((game, index) => (
        <Link
          key={game.key}
          href={`/${locale}/games/${game.key}`}
          className={`game-card game-${game.key}`}
        >
          <span
            className={`game-art game-art-${game.key}`}
            aria-hidden="true"
          />
          <span className="game-number">0{index + 1}</span>
          <span className="game-arrow">
            <Arrow />
          </span>
          <div className="game-card-copy">
            <span className="eyebrow">{t.categories[game.key]}</span>
            <h3 className="display">{game.name}</h3>
            <span className="text-link">
              {t.discover}
              <Arrow />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

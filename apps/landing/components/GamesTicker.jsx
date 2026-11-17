"use client";

import Link from "next/link";
import { useState } from "react";
import { games } from "@/lib/site";
import { editorial } from "./editorial-copy";

export default function GamesTicker({ locale, label = false }) {
  const [paused, setPaused] = useState(false);
  const english = locale === "en";
  const t = editorial(locale);
  return (
    <nav
      className={`games-ticker${label ? " games-ticker-dark" : ""}`}
      aria-label={t.games}
      data-paused={paused}
    >
      {label && <span className="eyebrow">{t.gameBand}</span>}
      <div className="ticker-window" onPointerDown={() => setPaused(true)}>
        <div className="ticker-track">
          {[false, true].map((duplicate) => (
            <ul
              className="ticker-group"
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
            >
              {games.map((game) => (
                <li key={game.key}>
                  <Link
                    href={`/${locale}/games/${game.key}`}
                    tabIndex={duplicate ? -1 : undefined}
                  >
                    {game.name}
                    <span aria-hidden="true">/</span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        className="ticker-toggle"
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={
          paused
            ? english
              ? "Resume game names"
              : "Reprendre le défilement des jeux"
            : english
              ? "Pause game names"
              : "Mettre le défilement des jeux en pause"
        }
      >
        <svg
          key={paused ? "play" : "pause"}
          className="state-icon"
          width="17"
          height="17"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          {paused ? (
            <path d="m6 3 10 7-10 7V3Z" />
          ) : (
            <path d="M5 3h3v14H5zm7 0h3v14h-3z" />
          )}
        </svg>
      </button>
    </nav>
  );
}

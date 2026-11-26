"use client";

import { useEffect, useRef, useState } from "react";
import t from "@egc/shared/admin.json";

const SPIN_MS = 5000;
const RADIUS = 470;
const colors = ["fill-accent", "fill-graphite", "fill-night"];

function point(degrees, radius) {
  const angle = (degrees * Math.PI) / 180;
  // Rounded so server and browser render identical paths (no hydration mismatch).
  return [Math.round(radius * Math.sin(angle) * 100) / 100, Math.round(-radius * Math.cos(angle) * 100) / 100];
}

// One slice per remaining player, clockwise from the pointer at the top.
function Wheel({ names, wheel }) {
  const slice = 360 / names.length;
  const fontSize = Math.min(30, Math.max(10, 1100 / names.length));

  return (
    <svg viewBox="-500 -520 1000 1020" className="h-full max-h-[78vh] w-full" role="img" aria-label={t.drawRemaining.replace("{n}", names.length)}>
      <g ref={wheel}>
        {names.length === 1 ? (
          <circle r={RADIUS} className="fill-accent" />
        ) : names.map((name, index) => {
          const [x1, y1] = point(index * slice, RADIUS);
          const [x2, y2] = point((index + 1) * slice, RADIUS);

          return (
            <path
              key={name + index}
              d={`M0 0 L${x1} ${y1} A${RADIUS} ${RADIUS} 0 ${slice > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
              // Avoid two equal colours where the last slice meets the first.
              className={`${index === names.length - 1 && index % 3 === 0 ? colors[1] : colors[index % 3]} stroke-offwhite/20`}
              strokeWidth="1.5"
            />
          );
        })}
        {names.map((name, index) => {
          const angle = (index + 0.5) * slice;
          // Labels run along the radius and always read left to right.
          const right = angle % 360 < 180;

          return (
            <text
              key={`label-${name}-${index}`}
              transform={`rotate(${angle}) translate(0 ${-RADIUS + 18}) rotate(${right ? -90 : 90})`}
              textAnchor={right ? "end" : "start"}
              dominantBaseline="middle"
              fontSize={fontSize}
              className="fill-offwhite font-display font-bold"
            >
              {name.length > 16 ? `${name.slice(0, 15)}…` : name}
            </text>
          );
        })}
      </g>
      <circle r="60" className="fill-night stroke-accent" strokeWidth="8" />
      <path d="M-28 -515 L28 -515 L0 -455 Z" className="fill-offwhite stroke-night" strokeWidth="4" />
    </svg>
  );
}

// Projector screen: the wheel lands on each player in turn; two players form a match
// (Space / → spin, ← undo). The pairing itself was drawn on the server when the draw was launched.
export default function DrawShow({ title, matches }) {
  // Byes have no second player: only real players go on the wheel.
  const sequence = matches.flatMap((match, index) =>
    [match.a, match.b].filter(Boolean).map((name) => ({ name, match: index })));
  const everyone = sequence.map((entry) => entry.name).sort((a, b) => a.localeCompare(b, "fr"));
  const [step, setStep] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const wheel = useRef(null);
  const drawn = sequence.slice(0, step);
  // Remove one wheel slice per drawn player (two players may share a name).
  const remaining = [...everyone];

  for (const entry of drawn) {
    remaining.splice(remaining.indexOf(entry.name), 1);
  }

  const done = step === sequence.length;
  const target = sequence[step];
  const current = target ? target.match : matches.length - 1;
  const formed = matches.map((match, index) => ({
    ...match,
    a: drawn.some((entry) => entry.match === index && entry.name === match.a) ? match.a : null,
    b: drawn.some((entry) => entry.match === index && entry.name === match.b) ? match.b : null,
  }));

  function spin() {
    if (spinning || done) {
      return;
    }

    const slice = 360 / remaining.length;
    const index = remaining.indexOf(target.name);
    // Turn at least 6 times, then stop with the target slice under the pointer.
    const stop = 360 - (index + 0.5) * slice + (Math.random() - 0.5) * slice * 0.6;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = wheel.current.animate(
      [{ transform: "rotate(0deg)" }, { transform: `rotate(${360 * 6 + stop}deg)` }],
      { duration: reduced ? 0 : SPIN_MS, easing: "cubic-bezier(0.15, 0.75, 0.1, 1)", fill: "forwards" },
    );
    setSpinning(true);
    animation.finished.then(() => {
      // Hold on the winner for a moment, then redraw the wheel without them.
      setTimeout(() => {
        animation.cancel();
        setSpinning(false);
        setStep((value) => value + 1);
      }, reduced ? 0 : 700);
    }).catch(() => setSpinning(false));
  }

  function back() {
    if (!spinning) {
      setStep((value) => Math.max(0, value - 1));
    }
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        spin();
      } else if (event.key === "ArrowLeft") {
        back();
      }
    }

    // Re-bound every render so the handler always sees the current wheel.
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const match = formed[current];

  return (
    <main className="flex min-h-dvh flex-col overflow-clip bg-night p-4 text-offwhite sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-lg font-bold uppercase tracking-widest text-accent">{title} · {t.tabDraw}</p>
        <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="border border-offwhite/30 px-4 py-2 text-sm">
          {t.fullscreen}
        </button>
      </header>

      <div className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex h-full items-center justify-center">
          {remaining.length ? <Wheel names={remaining} wheel={wheel} /> : (
            <p className="font-display text-5xl font-bold uppercase text-accent">{t.drawDone}</p>
          )}
        </div>

        <aside className="space-y-6">
          {match && (
            <section aria-live="polite" className="border border-accent bg-accent/10 p-6 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-accent">
                {t.drawMatch.replace("{n}", current + 1).replace("{total}", matches.length)}
              </p>
              <p className="draw-reveal mt-4 break-words font-display text-4xl font-bold" key={`a${match.a}`}>{match.a || "?"}</p>
              <p className="my-2 font-display text-2xl font-bold text-accent">{t.vs}</p>
              <p className="draw-reveal break-words font-display text-4xl font-bold" key={`b${match.b}`}>
                {match.b || (matches[current].b ? "?" : t.bye)}
              </p>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={spin} disabled={spinning || done} className="flex-1 bg-accent px-8 py-4 font-display text-xl font-bold uppercase text-offwhite disabled:opacity-40">
              {t.drawSpin}
            </button>
            <button type="button" onClick={back} disabled={spinning || step === 0} className="border border-offwhite/30 px-5 py-4 disabled:opacity-30">{t.drawPrevious}</button>
            <p className="w-full text-sm text-offwhite/50">{t.drawRemaining.replace("{n}", remaining.length)} · {t.drawKeys}</p>
          </div>

          <ol className="max-h-[40vh] space-y-1 overflow-y-auto text-sm">
            {formed.map((item, index) => (item.a && (item.b || !matches[index].b)) && (
              <li key={index} className="flex gap-2 border border-offwhite/15 px-3 py-2">
                <b className="w-8 shrink-0 text-accent">{index + 1}.</b>
                <span className="truncate">{item.a} – {item.b || t.bye}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}

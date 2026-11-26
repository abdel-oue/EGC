"use client";

import { useCallback, useEffect, useState } from "react";
import t from "@egc/shared/admin.json";

// Projector screen: reveals first-round matches one by one (Space / → next, ← back).
export default function DrawShow({ title, matches }) {
  const [step, setStep] = useState(0);
  const total = matches.length;
  const current = matches[step - 1];
  const next = useCallback(() => setStep((value) => Math.min(total, value + 1)), [total]);
  const back = useCallback(() => setStep((value) => Math.max(0, value - 1)), []);

  useEffect(() => {
    function onKey(event) {
      if (event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        back();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  return (
    <main className="flex min-h-dvh flex-col overflow-clip bg-night p-6 text-offwhite sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-lg font-bold uppercase tracking-widest text-accent">{title}</p>
        <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="border border-offwhite/30 px-4 py-2 text-sm">
          {t.fullscreen}
        </button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-10 text-center" aria-live="polite">
        {step === 0 && (
          <>
            <h1 className="font-display text-6xl font-bold uppercase sm:text-8xl">{t.tabDraw}</h1>
            <p className="mt-6 text-xl text-offwhite/70">{total} matchs</p>
          </>
        )}
        {current && (
          <div key={step} className="w-full max-w-6xl">
            <p className="draw-reveal font-display text-2xl font-bold uppercase tracking-widest text-accent">
              {t.drawMatch.replace("{n}", step).replace("{total}", total)}
            </p>
            <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
              <p className="draw-reveal draw-delay-1 font-display text-5xl font-bold break-words sm:text-7xl">{current.a}</p>
              <p className="draw-reveal draw-delay-2 font-display text-4xl font-bold text-accent">{t.vs}</p>
              <p className="draw-reveal draw-delay-3 font-display text-5xl font-bold break-words sm:text-7xl">{current.b || t.bye}</p>
            </div>
          </div>
        )}
        {step === total && total > 0 && <p className="mt-12 font-display text-2xl font-bold uppercase text-accent">{t.drawDone}</p>}
      </section>

      <nav className="flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={back} disabled={step === 0} className="border border-offwhite/30 px-6 py-3 disabled:opacity-30">{t.drawPrevious}</button>
        <button type="button" onClick={next} disabled={step === total} className="bg-accent px-8 py-4 font-display text-xl font-bold uppercase text-offwhite disabled:opacity-30">
          {step === 0 ? t.drawStart : t.drawNext}
        </button>
        <span className="w-full text-center text-sm text-offwhite/50">{t.drawKeys}</span>
      </nav>

      {step > 1 && (
        <ol className="mt-8 grid gap-2 text-sm text-offwhite/70 sm:grid-cols-2 lg:grid-cols-4">
          {matches.slice(0, step - 1).map((match, index) => (
            <li key={index} className="border border-offwhite/15 px-3 py-2">
              <b className="text-accent">{index + 1}.</b> {match.a} – {match.b || t.bye}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

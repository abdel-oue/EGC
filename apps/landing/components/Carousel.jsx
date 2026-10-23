"use client";

import { useRef } from "react";

// Horizontal scroll-snap row with prev/next arrows. Works with touch/trackpad without the arrows.
export default function Carousel({ heading, prevLabel, nextLabel, className = "", children }) {
  const track = useRef(null);
  const scroll = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className={className}>
      <div className="mb-6 flex items-end justify-between gap-4">
        {heading}
        <div className="flex gap-2">
          <ArrowButton label={prevLabel} onClick={() => scroll(-1)} flip />
          <ArrowButton label={nextLabel} onClick={() => scroll(1)} />
        </div>
      </div>
      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

function ArrowButton({ label, onClick, flip }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="chamfer-sm grid size-11 place-items-center bg-night text-offwhite transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
    >
      <svg viewBox="0 0 24 24" className={`size-5 ${flip ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  );
}

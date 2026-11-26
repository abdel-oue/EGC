"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Refreshes the server-rendered board every minute and can show it full screen (projector).
export default function LiveBoard({ title, updated, labels, toolbar, children }) {
  const router = useRouter();
  const board = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  function fullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      board.current?.requestFullscreen?.();
    }
  }

  return (
    <div ref={board} className="bracket-live flex min-h-[85vh] flex-col overflow-x-auto overflow-y-clip border border-offwhite/15 bg-surface-dark p-4 text-offwhite sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lg font-bold uppercase tracking-widest text-accent">{title}</p>
        <div className="flex flex-wrap items-center gap-4">
          <p role="status" className="text-xs text-offwhite/60">{labels.liveUpdate.replace("{time}", updated)}</p>
          <button type="button" onClick={fullscreen} className="border border-offwhite/30 px-4 py-2 text-sm font-bold">
            {labels.fullscreen}
          </button>
        </div>
      </div>
      {toolbar}
      <div className="flex flex-1">{children}</div>
    </div>
  );
}

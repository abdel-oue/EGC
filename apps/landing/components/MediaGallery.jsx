"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { localized } from "@egc/shared/i18n.js";

export default function MediaGallery({ items, locale, labels }) {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(0);
  const available = items.filter((item) => item.image_url);
  const current = available[selected];

  function move(direction) {
    setSelected((index) => (index + direction + available.length) % available.length);
  }

  function open(index) {
    setSelected(index);
    dialog.current.showModal();
  }

  function keyboard(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  }

  if (!available.length) {
    return <p className="border border-line bg-panel p-8">{labels.emptyGallery}</p>;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {available.map((item, index) => (
          <button key={item.id} type="button" onClick={() => open(index)} className="group border border-line bg-panel p-3 text-left">
            <div className="relative aspect-video">
              <Image
                src={item.image_url}
                alt={localized(item, "caption", locale)}
                fill
                unoptimized
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <span className="mt-4 block text-xs uppercase tracking-widest text-accent">
              {item.kind === "promotion" ? labels.promotion : labels.photo}
            </span>
            <span className="mt-2 block font-display text-lg font-bold">{localized(item, "caption", locale)}</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        onKeyDown={keyboard}
        aria-label={labels.gallery}
        className="fixed inset-0 m-auto max-h-[95svh] w-[95vw] max-w-6xl bg-night p-5 text-offwhite"
      >
        {current && (
          <>
            <div className="flex items-center justify-between gap-6">
              <p aria-live="polite">{localized(current, "caption", locale)}</p>
              <button type="button" onClick={() => dialog.current.close()} className="border border-offwhite/40 px-4 py-2">
                {labels.close}
              </button>
            </div>
            <div className="relative mt-5 h-[65svh]">
              <Image src={current.image_url} alt={localized(current, "caption", locale)} fill unoptimized sizes="95vw" className="object-contain" />
            </div>
            <div className="mt-4 flex justify-between">
              <button type="button" onClick={() => move(-1)} disabled={available.length < 2}>{labels.previous}</button>
              <span>{selected + 1} / {available.length}</span>
              <button type="button" onClick={() => move(1)} disabled={available.length < 2}>{labels.next}</button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

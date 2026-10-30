"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

// One section visible at a time; the URL hash (#bracket, #rules…) makes each tab shareable.
export default function EventTabs({ tabs, label }) {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
  const active = tabs.some((tab) => tab.id === hash) ? hash : tabs[0].id;

  function open(id) {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="mb-10 flex gap-2 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => open(tab.id)}
            className={`shrink-0 border-b-4 px-4 py-3 font-display font-bold uppercase transition-colors ${active === tab.id ? "border-accent text-accent" : "border-transparent text-night/60 hover:text-night"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <section
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="intro"
        >
          {tab.content}
        </section>
      ))}
    </div>
  );
}

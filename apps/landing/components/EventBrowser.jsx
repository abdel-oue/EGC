"use client";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { editorial } from "./editorial-copy";
import { games } from "@/lib/site";

function subscribe(callback) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
export default function EventBrowser({ locale, labels, game, upcoming, past }) {
  const t = editorial(locale);
  const selected = useSyncExternalStore(
    subscribe,
    () => (window.location.hash === "#past" ? "past" : "upcoming"),
    () => "upcoming",
  );
  const tabs = useRef([]);
  const tablist = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    function measure() {
      const tab = tabs.current[selected === "past" ? 1 : 0];
      if (tab)
        setIndicator((current) => {
          const next = { left: tab.offsetLeft, width: tab.offsetWidth };
          return current.left === next.left && current.width === next.width
            ? current
            : next;
        });
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (tablist.current) observer.observe(tablist.current);
    tabs.current.forEach((tab) => tab && observer.observe(tab));
    return () => observer.disconnect();
  }, [selected, locale]);
  const periods = [
    { id: "upcoming", label: t.upcoming },
    { id: "past", label: t.past },
  ];
  function open(id) {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  function keyboard(event, index) {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft")
      next = 1 - index;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 1;
    if (next === undefined) return;
    event.preventDefault();
    open(periods[next].id);
    tabs.current[next]?.focus();
  }
  return (
    <div className="event-browser site-width">
      <div className="event-toolbar">
        <div
          className="event-periods"
          role="tablist"
          aria-label={t.eventTabs}
          ref={tablist}
        >
          {periods.map((period, index) => (
            <button
              key={period.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              id={`period-${period.id}`}
              role="tab"
              aria-selected={selected === period.id}
              aria-controls={`events-${period.id}`}
              tabIndex={selected === period.id ? 0 : -1}
              onClick={() => open(period.id)}
              onKeyDown={(event) => keyboard(event, index)}
              type="button"
            >
              {period.label}
            </button>
          ))}
          <span
            className="event-tab-indicator"
            aria-hidden="true"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
            }}
          />
        </div>
        <form
          className="event-filter"
          action={`/${locale}/events${selected === "past" ? "#past" : ""}`}
        >
          <label className="sr-only" htmlFor="filter-game">
            {t.filter}
          </label>
          <select
            id="filter-game"
            name="game"
            defaultValue={games.some((item) => item.key === game) ? game : ""}
            onChange={(event) => event.currentTarget.form.requestSubmit()}
          >
            <option value="">{labels.allGames}</option>
            {games.map((item) => (
              <option value={item.key} key={item.key}>
                {item.name}
              </option>
            ))}
          </select>
        </form>
      </div>
      <section
        id="events-upcoming"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="period-upcoming"
        hidden={selected !== "upcoming"}
      >
        {upcoming}
      </section>
      <section
        id="events-past"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="period-past"
        hidden={selected !== "past"}
      >
        {past}
      </section>
    </div>
  );
}

import Link from "next/link";
import { eventDate, localized } from "@egc/shared/i18n.js";
import { registrationFull, registrationOpen } from "@egc/shared/validation.js";
import { games } from "@/lib/site";
import { editorial } from "./editorial-copy";
import { Arrow } from "./Editorial";
import EventEmpty from "./EventEmpty";

// "12 / 64 inscrits", or the full notice once every place is taken.
export function placesLabel(event, labels) {
  if (registrationFull(event)) {
    return labels.full;
  }

  return labels.placesCount
    .replace("{taken}", event.registration_count ?? 0)
    .replace("{max}", event.max_registrations);
}

export default function EventList({
  events,
  locale,
  labels,
  unavailable = false,
  past = false,
}) {
  if (unavailable || !events.length)
    return (
      <EventEmpty
        locale={locale}
        labels={labels}
        past={past}
        unavailable={unavailable}
      />
    );
  const t = editorial(locale);
  return (
    <div className="event-grid">
      {events.map((event) => (
        <article
          key={event.id || event.slug}
          className={`event-card event-card-${event.game || "club"}${past ? " event-card-past" : ""}`}
        >
          {!past && (
            <div className="event-card-art" aria-hidden="true">
              <span className={`game-art game-art-${event.game || "club"}`} />
              <span className="event-badge">{t.upcoming}</span>
            </div>
          )}
          <div className="event-card-copy">
            <div className="event-card-heading">
              <p className="eyebrow accent">
                {games.find((game) => game.key === event.game)?.name ||
                  (/(^|-)2xko(-|$)/i.test(event.slug || "") ? "2XKO" : "EGC")}
              </p>
              {past && <span className="event-badge event-badge-inline">{t.ended}</span>}
            </div>
            <h3 className="display">{localized(event, "title", locale)}</h3>
            <p className="event-meta">
              <time dateTime={event.starts_at}>
                {eventDate(event.starts_at, locale)}
              </time>
              {event.location && <span>{event.location}</span>}
              {event.max_registrations && !past && (
                <span>{placesLabel(event, labels)}</span>
              )}
            </p>
            <Link
              href={`/${locale}/events/${event.slug}`}
              className="text-link"
            >
              {past ? t.recap : labels.details}
              <Arrow />
            </Link>
            {registrationOpen(event) && (
              <Link
                href={`/${locale}/events/${event.slug}/register`}
                className="pill event-signup"
              >
                {labels.signup}
                <Arrow />
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

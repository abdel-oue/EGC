import Link from "@/components/Link";
import { eventDate, localized } from "@egc/shared/i18n.js";
import { registrationOpen } from "@egc/shared/validation.js";

export default function EventList({ events, locale, labels, unavailable = false }) {
  if (unavailable) {
    return <p role="status">{labels.unavailable}</p>;
  }

  if (!events.length) {
    return <p className="border border-line bg-panel p-8">{labels.emptyEvents}</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event) => (
        <article key={event.id} className="brand-panel flex flex-col gap-5 border border-line bg-offwhite p-7">
          <p className="text-sm font-bold text-accent">{eventDate(event.starts_at, locale)}</p>
          <h3 className="font-display text-2xl font-bold uppercase">{localized(event, "title", locale)}</h3>
          <p className="text-night/70">{event.location}</p>
          <Link href={`/${locale}/events/${event.slug}`} className="mt-auto font-bold underline decoration-accent underline-offset-8">
            {labels.details} <span aria-hidden="true">→</span>
          </Link>
          {registrationOpen(event) && (
            <Link href={`/${locale}/events/${event.slug}/register`} className="self-start bg-accent px-5 py-3 font-bold text-offwhite">
              {labels.signup}
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}

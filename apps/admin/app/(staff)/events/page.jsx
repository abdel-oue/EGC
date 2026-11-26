import Link from "next/link";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { requireStaff } from "@/lib/auth";
import { eventStats, splitEvents } from "@/lib/registrations";

function EventRows({ events, rows }) {
  return (
    <ul className="divide-y divide-line border border-line">
      {events.map((event) => {
        const stats = eventStats(rows.filter((row) => row.event_id === event.id));

        return (
          <li key={event.id}>
            <Link href={`/events/${event.id}`} className="flex flex-wrap items-center justify-between gap-3 bg-panel p-5 hover:bg-offwhite">
              <span>
                <span className="block font-bold">{event.title_fr}</span>
                <span className="block text-sm text-graphite/70">{eventDate(event.starts_at)} · {t.options[event.status]}</span>
              </span>
              <span className="text-sm">
                {t.places} : <b>{stats.taken}{event.max_registrations ? ` / ${event.max_registrations}` : ""}</b>
                {stats.toReview > 0 && <> · <b className="text-accent">{stats.toReview} {t.toReview.toLowerCase()}</b></>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function EventsPage() {
  const { client } = await requireStaff();
  const [{ data: events, error }, { data: rows }] = await Promise.all([
    client.from("events").select("id,title_fr,starts_at,status,max_registrations").order("starts_at", { ascending: false }),
    client.from("event_registrations").select("event_id,status,email,paid,checked_in_at"),
  ]);
  const { upcoming, past } = splitEvents(events || []);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold uppercase">{t.events}</h1>
        <Link href="/events/new" className="bg-accent px-5 py-2 font-bold text-offwhite">{t.newEvent}</Link>
      </div>
      {error && <p role="alert">{t.unavailable}</p>}
      <h2 className="mb-4 font-display text-xl font-bold uppercase">{t.upcomingEvents}</h2>
      {upcoming.length ? <EventRows events={upcoming} rows={rows || []} /> : <p>{t.noUpcoming}</p>}
      {past.length > 0 && (
        <>
          <h2 className="mb-4 mt-12 font-display text-xl font-bold uppercase">{t.pastEvents}</h2>
          <EventRows events={past} rows={rows || []} />
        </>
      )}
      <Link href="/submissions/legacy" className="mt-12 block text-sm underline">{t.legacyLink}</Link>
    </>
  );
}

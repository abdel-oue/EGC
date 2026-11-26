import Link from "next/link";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { requireStaff } from "@/lib/auth";
import { eventStats, upcomingSince } from "@/lib/registrations";

function Stat({ value, label, highlight }) {
  return (
    <div>
      <span className={`block font-display text-2xl font-bold ${highlight && value ? "text-accent" : ""}`}>{value}</span>
      <span className="block text-sm text-graphite/70">{label}</span>
    </div>
  );
}

export default async function Dashboard() {
  const { client } = await requireStaff();
  const since = upcomingSince();
  const count = (table, status) => client.from(table).select("id", { count: "exact", head: true }).eq("status", status);
  const [{ data: events, error }, registrations, messages, responses] = await Promise.all([
    client.from("events").select("id,title_fr,starts_at,status,max_registrations").gte("starts_at", since).order("starts_at"),
    count("event_registrations", "pending"),
    count("contact_messages", "new"),
    count("form_responses", "pending"),
  ]);
  const { data: rows } = events?.length
    ? await client.from("event_registrations").select("event_id,status,email,paid,checked_in_at").in("event_id", events.map((event) => event.id))
    : { data: [] };
  const todo = [
    [registrations, "pendingRegistrations", "/events"],
    [messages, "newMessages", "/submissions/contacts?status=new"],
    [responses, "pendingResponses", "/submissions/responses?status=pending"],
  ];

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase sm:text-4xl">{t.dashboard}</h1>
      <section aria-labelledby="upcoming" className="mb-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 id="upcoming" className="font-display text-xl font-bold uppercase">{t.upcomingEvents}</h2>
          <Link href="/events/new" className="bg-accent px-5 py-2 font-bold text-offwhite">{t.newEvent}</Link>
        </div>
        {error && <p role="alert">{t.unavailable}</p>}
        {!error && !events?.length && <p>{t.noUpcoming}</p>}
        <div className="grid gap-5 md:grid-cols-2">
          {events?.map((event) => {
            const stats = eventStats(rows?.filter((row) => row.event_id === event.id));

            return (
              <Link key={event.id} href={`/events/${event.id}`} className="block border border-line bg-panel p-6">
                <span className="text-sm text-graphite/70">
                  {eventDate(event.starts_at)} · {t.options[event.status]}
                </span>
                <span className="mt-1 block font-display text-xl font-bold">{event.title_fr}</span>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat value={`${stats.taken}${event.max_registrations ? ` / ${event.max_registrations}` : ""}`} label={t.places} />
                  <Stat value={stats.toReview} label={t.toReview} highlight />
                  <Stat value={stats.unpaid} label={t.unpaid} highlight />
                  <Stat value={stats.present} label={t.present} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section aria-labelledby="todo">
        <h2 id="todo" className="mb-5 font-display text-xl font-bold uppercase">{t.todo}</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {todo.map(([result, label, href]) => (
            <Link key={label} href={href} className="border border-line bg-panel p-6">
              <span className="block font-display text-4xl font-bold text-accent">{result.error ? "—" : result.count}</span>
              <span className="mt-3 block font-bold">{t[label]}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

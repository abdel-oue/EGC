import Link from "next/link";
import { notFound } from "next/navigation";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { requireStaff } from "@/lib/auth";
import { generateBracket, saveContent } from "@/lib/actions";
import { eventStats } from "@/lib/registrations";
import ActionForm from "@/components/ActionForm";
import BracketPanel, { entryName } from "@/components/BracketPanel";
import ContentForm from "@/components/ContentForm";
import RegistrationsPanel from "@/components/RegistrationsPanel";

const tabs = [
  ["registrations", "tabRegistrations"],
  ["draw", "tabDraw"],
  ["bracket", "tabBracket"],
  ["info", "tabInfo"],
];

function DrawPanel({ eventId, entries, matches }) {
  const names = new Map(entries.map((entry) => [entry.id, entryName(entry)]));
  const first = matches.filter((match) => match.round === 1);

  return (
    <div className="max-w-3xl space-y-8">
      <p>{t.drawNote}</p>
      <div className="border border-line bg-panel p-5 sm:p-6">
        <p className="mb-5 font-bold">{t.approvedEntries} : {entries.length}</p>
        <ActionForm action={generateBracket.bind(null, eventId)} submitLabel={matches.length ? t.drawRedo : t.drawLaunch}>
          <input type="hidden" name="mode" value="draw" />
          {matches.length > 0 && (
            <label className="flex items-center gap-3">
              <input type="checkbox" name="confirm" className="size-5" />
              <span>{t.confirmRegenerate}</span>
            </label>
          )}
        </ActionForm>
      </div>
      {first.length ? (
        <>
          <a href={`/draw/${eventId}`} target="_blank" rel="noopener" className="inline-flex bg-night px-6 py-3 font-bold text-offwhite">{t.drawScreen} ↗</a>
          <ol className="divide-y divide-line border border-line">
            {first.map((match) => (
              <li key={match.id} className="grid grid-cols-[3rem_1fr] gap-3 bg-panel p-4">
                <span className="font-display font-bold text-accent">{match.position + 1}</span>
                <span>{names.get(match.team_a) || t.tbd} <b className="text-accent">{t.vs}</b> {match.team_b ? names.get(match.team_b) : t.bye}</span>
              </li>
            ))}
          </ol>
        </>
      ) : <p>{t.drawNone}</p>}
    </div>
  );
}

export default async function EventHub({ params, searchParams }) {
  const { id } = await params;
  const { tab: requested } = await searchParams;
  const tab = tabs.some(([key]) => key === requested) ? requested : "registrations";
  const { client } = await requireStaff();

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const [{ data: event, error }, { data: rows }, { data: matches }] = await Promise.all([
    client.from("events").select("*").eq("id", id).maybeSingle(),
    client.from("event_registrations").select("*").eq("event_id", id).order("created_at"),
    client.from("event_matches").select("*").eq("event_id", id).order("round").order("position"),
  ]);

  if (error) {
    return <p role="alert">{t.unavailable}</p>;
  }

  if (!event) {
    notFound();
  }

  const stats = eventStats(rows || []);
  const entries = (rows || []).filter((row) => row.status === "approved");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <Link href="/events" className="mb-4 block underline">{t.back}</Link>
      <header className="mb-6">
        <p className="text-sm text-graphite/70">{eventDate(event.starts_at)} · {t.options[event.status]} · {event.location}</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase">{event.title_fr}</h1>
        <p className="mt-2">
          {t.places} : <b>{stats.taken} / {event.max_registrations || t.unlimited}</b>
          {event.status === "published" && (
            <> · <a href={`${site}/fr/events/${event.slug}`} target="_blank" rel="noopener" className="underline">{t.viewOnSite} ↗</a></>
          )}
        </p>
      </header>
      <nav aria-label={event.title_fr} className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/events/${id}?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`whitespace-nowrap px-4 py-3 font-bold ${tab === key ? "border-b-2 border-accent text-accent" : "text-graphite/70"}`}
          >
            {t[label]}
            {key === "registrations" && ` (${rows?.length || 0})`}
          </Link>
        ))}
      </nav>
      {tab === "registrations" && <RegistrationsPanel eventId={id} slug={event.slug} rows={rows || []} />}
      {tab === "draw" && <DrawPanel eventId={id} entries={entries} matches={matches || []} />}
      {tab === "bracket" && <BracketPanel eventId={id} entries={entries} matches={matches || []} />}
      {tab === "info" && (
        <ContentForm resource="events" record={event} events={[]} action={saveContent.bind(null, "events", id)} />
      )}
    </>
  );
}

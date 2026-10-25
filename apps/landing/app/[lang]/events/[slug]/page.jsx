import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import { eventDate, localized } from "@egc/shared/i18n.js";
import { registrationOpen } from "@egc/shared/validation.js";
import { publicClient } from "@egc/shared/supabase.js";
import PageHeader from "@/components/PageHeader";
import HudButton from "@/components/HudButton";
import Bracket from "@/components/Bracket";
import { upcomingEvents } from "@/components/Season";
import { getContent, getEventResults } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

export async function generateStaticParams() {
  const client = publicClient();
  const { data } = client
    ? await client.from("events").select("slug").eq("status", "published")
    : { data: [] };
  const rows = data || [];
  return rows.length
    ? rows.map((event) => ({ slug: event.slug }))
    : [{ slug: "event-preview" }];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { rows } = await getContent("events");
  const event = rows.find((item) => item.slug === slug);
  const locale = await lang();

  return {
    title: event ? localized(event, "title", locale) : "EGC",
    description: event ? localized(event, "description", locale) : "",
    alternates: alternates(locale, `/events/${slug}`),
  };
}

export default async function EventPage({ params }) {
  await connection();
  const { slug } = await params;
  const { rows, unavailable } = await getContent("events");
  const dict = await getDictionary();
  const locale = await lang();
  const event = rows.find((item) => item.slug === slug);

  if (unavailable) {
    return <main className="p-12"><p role="status">{dict.content.unavailable}</p></main>;
  }

  if (!event) {
    notFound();
  }

  const { participants, matches } = await getEventResults(event.id);
  const names = new Map(participants.map((entry) => [entry.id, entry.team_name || entry.players[0]]));
  const rules = localized(event, "rules", locale).split("\n").map((rule) => rule.trim()).filter(Boolean);
  const past = !(await upcomingEvents([event])).length;
  const labels = dict.content;

  return (
    <main>
      <PageHeader ghost={dict.nav.events} title={localized(event, "title", locale)} intro={eventDate(event.starts_at, locale)} />
      <article className="mx-auto max-w-5xl space-y-14 px-6 pb-24">
        <div className="space-y-6">
          <p className="whitespace-pre-line text-lg">{localized(event, "description", locale)}</p>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div><dt className="font-bold">{labels.date}</dt><dd>{eventDate(event.starts_at, locale)}</dd></div>
            <div><dt className="font-bold">{labels.location}</dt><dd>{event.location}</dd></div>
            <div>
              <dt className="font-bold">{labels.format}</dt>
              <dd>{event.entry_type === "team" ? `${labels.teamFormat} · ${event.player_count}v${event.player_count}` : labels.individualFormat}</dd>
            </div>
          </dl>
          {registrationOpen(event) ? (
            <HudButton href={`/${locale}/events/${slug}/register`}>{labels.signup}</HudButton>
          ) : <p>{past ? labels.pastEvent : labels.closed}</p>}
        </div>
        {rules.length > 0 && (
          <section aria-labelledby="rules">
            <h2 id="rules" className="mb-6 font-display text-3xl font-bold uppercase">{labels.rulesTitle}</h2>
            <ol className="list-inside list-decimal space-y-2 border border-line bg-panel p-6">
              {rules.map((rule, index) => <li key={index}>{rule}</li>)}
            </ol>
          </section>
        )}
        <section aria-labelledby="participants">
          <h2 id="participants" className="mb-6 font-display text-3xl font-bold uppercase">
            {labels.participants} ({participants.length})
          </h2>
          {participants.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((entry) => (
                <li key={entry.id} className="border border-line bg-offwhite p-4">
                  {entry.team_name && <p className="font-display text-lg font-bold">{entry.team_name}</p>}
                  <p className="text-night/70">{entry.players.join(" · ")}</p>
                </li>
              ))}
            </ul>
          ) : <p className="border border-line bg-panel p-6">{labels.noParticipants}</p>}
        </section>
        <section aria-labelledby="bracket">
          <h2 id="bracket" className="mb-6 font-display text-3xl font-bold uppercase">{labels.bracket}</h2>
          {matches.length ? (
            <Bracket matches={matches} names={names} labels={labels} />
          ) : <p className="border border-line bg-panel p-6">{labels.noBracket}</p>}
        </section>
      </article>
    </main>
  );
}

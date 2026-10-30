import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import { eventDate, localized } from "@egc/shared/i18n.js";
import { registrationOpen } from "@egc/shared/validation.js";
import { seedEntries } from "@egc/shared/bracket.js";
import { publicClient } from "@egc/shared/supabase.js";
import PageHeader from "@/components/PageHeader";
import HudButton from "@/components/HudButton";
import Bracket from "@/components/Bracket";
import EventTabs from "@/components/EventTabs";
import Standings from "@/components/Standings";
import Rules, { ruleSections } from "@/components/Rules";
import Prizes from "@/components/Prizes";
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
  const entries = seedEntries(participants.map((entry) => ({ ...entry, players: entry.roster || [] })));
  const names = new Map(entries.map((entry) => [entry.id, entry.team_name || entry.players[0]?.handle]));
  const seeds = new Map(entries.map((entry, index) => [entry.id, index + 1]));
  const rules = ruleSections(localized(event, "rules", locale));
  const past = !(await upcomingEvents([event])).length;
  const labels = dict.content;
  const tabs = [
    {
      id: "info",
      label: labels.tabInfo,
      content: (
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
          <Prizes text={event.prizes || ""} labels={labels} />
          {registrationOpen(event) ? (
            <HudButton href={`/${locale}/events/${slug}/register`}>{labels.signup}</HudButton>
          ) : <p>{past ? labels.pastEvent : labels.closed}</p>}
        </div>
      ),
    },
    {
      id: "standings",
      label: `${labels.tabStandings} (${entries.length})`,
      content: entries.length
        ? <Standings entries={entries} labels={labels} rankNames={dict.register.ranks} />
        : <p className="border border-line bg-panel p-6">{labels.noParticipants}</p>,
    },
    {
      id: "bracket",
      label: labels.tabBracket,
      content: (
        <div className="space-y-8">
          <Prizes text={event.prizes || ""} labels={labels} />
          {matches.length
            ? <Bracket matches={matches} names={names} seeds={seeds} labels={labels} />
            : <p className="border border-line bg-panel p-6">{labels.noBracket}</p>}
        </div>
      ),
    },
  ];

  if (rules.length) {
    tabs.push({
      id: "rules",
      label: labels.tabRules,
      content: <Rules sections={rules} />,
    });
  }

  return (
    <main>
      <PageHeader ghost={dict.nav.events} title={localized(event, "title", locale)} intro={eventDate(event.starts_at, locale)} />
      <article className="mx-auto max-w-6xl px-6 pb-24">
        <EventTabs tabs={tabs} label={labels.sections} />
      </article>
    </main>
  );
}

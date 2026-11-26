import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import { roundName, seedEntries } from "@egc/shared/bracket.js";
import BracketBoard from "@/components/BracketBoard";
import LiveBoard from "@/components/LiveBoard";
import { getContent, getEventResults, renderedAt } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../../dictionaries";

export { generateStaticParams } from "../page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const dict = await getDictionary();

  return {
    title: dict.content.tabBracket,
    alternates: alternates(await lang(), `/events/${slug}/bracket`),
    robots: { index: false, follow: true },
  };
}

// Live two-sided bracket for the projector: refreshes every minute.
export default async function BracketPage({ params, searchParams }) {
  await connection();
  const { slug } = await params;
  const { from: requested } = await searchParams;
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
  const labels = dict.content;
  const total = matches.length ? Math.max(...matches.map((match) => match.round)) : 0;
  const from = Math.min(Math.max(1, Number.parseInt(requested, 10) || 1), Math.max(1, total));
  // One choice per starting round, always shown through to the final.
  const toolbar = total > 1 && (
    <nav aria-label={labels.showFrom} className="mb-4 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-offwhite/60">{labels.showFrom} :</span>
      {Array.from({ length: total - 1 }, (_, index) => index + 1).map((round) => (
        <Link
          key={round}
          href={`/${locale}/events/${slug}/bracket${round > 1 ? `?from=${round}` : ""}`}
          aria-current={round === from ? "page" : undefined}
          className={`border px-3 py-1.5 font-bold uppercase ${round === from ? "border-accent bg-accent text-offwhite" : "border-offwhite/30 text-offwhite/80"}`}
        >
          {roundName(round, total, labels)}
        </Link>
      ))}
    </nav>
  );

  return (
    <main className="mx-auto max-w-[1800px] px-4 pb-16 pt-6 sm:px-6">
      <Link href={`/${locale}/events/${slug}`} className="mb-4 inline-block underline">{labels.back}</Link>
      <LiveBoard title={localized(event, "title", locale)} updated={renderedAt(locale)} labels={labels} toolbar={toolbar}>
        {matches.length
          ? <BracketBoard matches={matches} names={names} seeds={seeds} labels={labels} from={from} />
          : <p className="p-6">{labels.noBracket}</p>}
      </LiveBoard>
    </main>
  );
}

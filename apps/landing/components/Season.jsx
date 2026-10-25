import Link from "next/link";
import { lang } from "next/root-params";
import EventList from "@/components/EventList";
import { getContent } from "@/lib/content";

export async function upcomingEvents(rows) {
  return rows.filter((event) => new Date(event.starts_at).getTime() > Date.now());
}

export default async function Season({ dict, game, limit, showPast = false }) {
  const locale = await lang();
  const { rows, unavailable } = await getContent("events");
  const forGame = game ? rows.filter((event) => event.game === game) : rows;
  const upcoming = await upcomingEvents(forGame);
  const past = forGame.filter((event) => !upcoming.includes(event)).reverse();

  return (
    <section id="season" className="scroll-mt-16 px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 font-display text-4xl font-bold uppercase">{dict.content.upcoming}</h2>
        <EventList events={limit ? upcoming.slice(0, limit) : upcoming} locale={locale} labels={dict.content} unavailable={unavailable} />
        {limit && upcoming.length > 0 && (
          <Link href={`/${locale}/events`} className="mt-8 inline-block font-bold underline decoration-accent underline-offset-8">
            {dict.content.allEvents} <span aria-hidden="true">→</span>
          </Link>
        )}
        {showPast && past.length > 0 && (
          <>
            <h2 className="mb-10 mt-20 font-display text-4xl font-bold uppercase">{dict.content.past}</h2>
            <EventList events={past} locale={locale} labels={dict.content} />
          </>
        )}
      </div>
    </section>
  );
}

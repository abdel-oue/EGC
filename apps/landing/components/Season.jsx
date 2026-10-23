import { lang } from "next/root-params";
import EventList from "@/components/EventList";
import { getContent } from "@/lib/content";

export async function upcomingEvents(rows) {
  return rows.filter((event) => new Date(event.starts_at).getTime() > Date.now());
}

export default async function Season({ dict, game }) {
  const locale = await lang();
  const { rows, unavailable } = await getContent("events");
  const upcoming = await upcomingEvents(rows);
  const events = game ? upcoming.filter((event) => event.game === game) : upcoming;

  return (
    <section id="season" className="scroll-mt-16 px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 font-display text-4xl font-bold uppercase">{dict.content.upcoming}</h2>
        <EventList events={events} locale={locale} labels={dict.content} unavailable={unavailable} />
      </div>
    </section>
  );
}

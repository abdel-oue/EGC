import Link from "next/link";
import { lang } from "next/root-params";
import EventList from "@/components/EventList";
import EventBrowser from "@/components/EventBrowser";
import { Arrow } from "@/components/Editorial";
import { getContent } from "@/lib/content";

export async function upcomingEvents(rows) {
  return rows.filter(
    (event) => new Date(event.starts_at).getTime() > Date.now(),
  );
}
export default async function Season({ dict, game, limit, showPast = false }) {
  const locale = await lang();
  const { rows, unavailable } = await getContent("events");
  const forGame = game ? rows.filter((event) => event.game === game) : rows;
  const upcoming = await upcomingEvents(forGame);
  const past = forGame.filter((event) => !upcoming.includes(event)).reverse();
  if (showPast)
    return (
      <EventBrowser
        locale={locale}
        labels={dict.content}
        game={game}
        upcoming={
          <EventList
            events={upcoming}
            locale={locale}
            labels={dict.content}
            unavailable={unavailable}
          />
        }
        past={
          <EventList
            events={past}
            locale={locale}
            labels={dict.content}
            unavailable={unavailable}
            past
          />
        }
      />
    );
  return (
    <section id="season" className="home-season site-width">
      <div className="section-heading">
        <p className="eyebrow">EGC / Events</p>
        <h2 className="display">{dict.content.upcoming}</h2>
      </div>
      <EventList
        events={limit ? upcoming.slice(0, limit) : upcoming}
        locale={locale}
        labels={dict.content}
        unavailable={unavailable}
      />
      {limit && upcoming.length > 0 && (
        <Link href={`/${locale}/events`} className="text-link all-events">
          {dict.content.allEvents}
          <Arrow />
        </Link>
      )}
    </section>
  );
}

import { connection } from "next/server";
import { lang } from "next/root-params";
import { PageIntro, GamesBand } from "@/components/Editorial";
import { editorial } from "@/components/editorial-copy";
import Season from "@/components/Season";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const dict = await getDictionary();

  return {
    title: dict.pages.events.title,
    description: dict.pages.events.intro,
    alternates: alternates(await lang(), "/events"),
  };
}

export default async function EventsPage({ searchParams }) {
  await connection();
  const { game } = await searchParams;
  const dict = await getDictionary();
  const locale = await lang();
  const t = editorial(locale);

  return (
    <main className="events-page">
      <PageIntro
        eyebrow={t.eventsEyebrow}
        lines={t.eventsLines}
        intro={t.eventsIntro}
        accessibleTitle={dict.pages.events.title}
      />
      <Season dict={dict} game={game} showPast />
      <GamesBand locale={locale} />
    </main>
  );
}

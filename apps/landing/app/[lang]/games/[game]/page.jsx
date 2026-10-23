import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import EventList from "@/components/EventList";
import MediaGallery from "@/components/MediaGallery";
import PageHeader from "@/components/PageHeader";
import HudButton from "@/components/HudButton";
import { getContent } from "@/lib/content";
import { games } from "@/lib/site";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

export function generateStaticParams() {
  return games.map((game) => ({ game: game.key }));
}

export async function generateMetadata({ params }) {
  const { game } = await params;
  const selected = games.find((item) => item.key === game);
  const dict = await getDictionary();

  return {
    title: selected?.name,
    description: dict.pages.gallery.intro,
    alternates: alternates(await lang(), `/games/${game}`),
  };
}

export default async function GamePage({ params }) {
  await connection();
  const { game } = await params;
  const selected = games.find((item) => item.key === game);

  if (!selected) {
    notFound();
  }

  const locale = await lang();
  const dict = await getDictionary();
  const [media, events] = await Promise.all([getContent("gallery_media"), getContent("events")]);

  return (
    <main className="brand-panel">
      <PageHeader ghost={selected.name} title={selected.name} intro={dict.content.gallery} />
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-label={dict.content.gallery}>
        {media.unavailable ? <p role="status">{dict.content.unavailable}</p> : (
          <MediaGallery items={media.rows.filter((item) => item.game === game)} locale={locale} labels={dict.content} />
        )}
      </section>
      <section id="events" className="scroll-mt-20 border-t border-line bg-panel px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 font-display text-3xl font-bold uppercase">{dict.content.upcoming}</h2>
          <EventList events={events.rows.filter((item) => item.game === game && new Date(item.starts_at) > new Date())} locale={locale} labels={dict.content} unavailable={events.unavailable} />
          <HudButton href={`/${locale}/events?game=${game}`} className="mt-10">{dict.content.viewEvents}</HudButton>
        </div>
      </section>
    </main>
  );
}

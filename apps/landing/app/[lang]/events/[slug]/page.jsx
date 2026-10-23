import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import { eventDate, localized } from "@egc/shared/i18n.js";
import { registrationOpen } from "@egc/shared/validation.js";
import { publicClient } from "@egc/shared/supabase.js";
import PageHeader from "@/components/PageHeader";
import HudButton from "@/components/HudButton";
import { getContent } from "@/lib/content";
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

  return (
    <main>
      <PageHeader ghost={dict.nav.events} title={localized(event, "title", locale)} intro={eventDate(event.starts_at, locale)} />
      <article className="mx-auto max-w-4xl space-y-8 px-6 pb-24">
        <p className="whitespace-pre-line text-lg">{localized(event, "description", locale)}</p>
        <p>{dict.content.location} : {event.location}</p>
        {registrationOpen(event) ? (
          <HudButton href={`/${locale}/events/${slug}/register`}>{dict.content.signup}</HudButton>
        ) : <p>{dict.content.closed}</p>}
      </article>
    </main>
  );
}

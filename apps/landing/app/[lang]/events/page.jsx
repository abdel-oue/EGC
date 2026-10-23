import { connection } from "next/server";
import { lang } from "next/root-params";
import PageHeader from "@/components/PageHeader";
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

  return (
    <main>
      <PageHeader {...dict.pages.events} />
      <Season dict={dict} game={game} />
    </main>
  );
}

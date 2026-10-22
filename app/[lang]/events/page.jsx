import { lang } from "next/root-params";
import PageHeader from "@/components/PageHeader";
import Season from "@/components/Season";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.events;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/events") };
}

export default async function EventsPage() {
  const dict = await getDictionary();
  const t = dict.pages.events;

  return (
    <main>
      <PageHeader ghost={t.ghost} title={t.title} intro={t.intro} />
      <Season dict={dict} />
      <div className="-mt-16 px-4 pb-24 sm:px-8 lg:px-12">
        <p className="mx-auto max-w-6xl text-sm text-night/60">{t.note}</p>
      </div>
    </main>
  );
}

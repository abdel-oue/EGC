import { lang } from "next/root-params";
import EmptyState from "@/components/EmptyState";
import HudButton from "@/components/HudButton";
import PageHeader from "@/components/PageHeader";
import { socials } from "@/lib/site";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.gallery;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/gallery") };
}

export default async function GalleryPage() {
  const dict = await getDictionary();
  const t = dict.pages.gallery;

  return (
    <main>
      <PageHeader ghost={t.ghost} title={t.title} intro={t.intro} />
      <div className="px-4 pb-24 sm:px-8 lg:px-12">
        <EmptyState title={t.emptyTitle} text={t.emptyText}>
          <HudButton href={socials.instagram} variant="night">
            {dict.empty.instagram}
          </HudButton>
        </EmptyState>
      </div>
    </main>
  );
}

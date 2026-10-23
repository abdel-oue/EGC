import { lang } from "next/root-params";
import MediaGallery from "@/components/MediaGallery";
import PageHeader from "@/components/PageHeader";
import { getContent } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const dict = await getDictionary();

  return {
    title: dict.pages.gallery.title,
    description: dict.pages.gallery.intro,
    alternates: alternates(await lang(), "/gallery"),
  };
}

export default async function GalleryPage() {
  const dict = await getDictionary();
  const { rows, unavailable } = await getContent("gallery_media");

  return (
    <main>
      <PageHeader {...dict.pages.gallery} />
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-label={dict.content.gallery}>
        {unavailable ? <p role="status">{dict.content.unavailable}</p> : (
          <MediaGallery items={rows} locale={await lang()} labels={dict.content} />
        )}
      </section>
    </main>
  );
}

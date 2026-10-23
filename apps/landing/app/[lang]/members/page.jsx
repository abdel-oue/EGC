import Image from "next/image";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import PageHeader from "@/components/PageHeader";
import { getContent } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

const crops = {
  "-100": "object-[center_48%]",
  "-80": "object-[center_45.4%]",
  "0": "object-[center_35%]",
  "90": "object-[center_13.3%]",
};

export async function generateMetadata() {
  const dict = await getDictionary();

  return {
    title: dict.pages.members.title,
    description: dict.pages.members.intro,
    alternates: alternates(await lang(), "/members"),
  };
}

export default async function MembersPage() {
  const locale = await lang();
  const dict = await getDictionary();
  const { rows, unavailable } = await getContent("members");

  return (
    <main className="brand-panel">
      <PageHeader {...dict.pages.members} />
      <section aria-label={dict.content.members} className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 sm:grid-cols-2 xl:grid-cols-3">
        {unavailable && <p role="status">{dict.content.unavailable}</p>}
        {rows.map((member) => (
          <article key={member.id} className="border border-line bg-offwhite p-4">
            <div className="hud-corners relative aspect-[760/580] bg-panel">
              {member.image_url && (
                <Image
                  src={member.image_url}
                  alt={member.name}
                  fill
                  unoptimized
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className={`object-cover ${crops[member.photo_offset_y] || crops[0]}`}
                />
              )}
            </div>
            <div className="pt-6 text-center">
              <div aria-hidden="true" className="mx-auto mb-4 h-px w-16 bg-accent" />
              <h2 className="font-display text-xl font-bold">{member.name}</h2>
              <p className="mt-2 text-night/70">{localized(member, "role", locale)}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

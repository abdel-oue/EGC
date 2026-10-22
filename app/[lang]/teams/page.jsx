import { lang } from "next/root-params";
import EmptyState from "@/components/EmptyState";
import HudButton from "@/components/HudButton";
import OpenRegistration from "@/components/OpenRegistration";
import PageHeader from "@/components/PageHeader";
import { games, socials } from "@/lib/site";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.teams;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/teams") };
}

export default async function TeamsPage() {
  const locale = await lang();
  const dict = await getDictionary();
  const t = dict.pages.teams;

  return (
    <main>
      <PageHeader ghost={t.ghost} title={t.title} intro={t.intro} />
      <div className="px-4 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
        {games
          .filter((game) => game.registration)
          .map((game) => (
            <OpenRegistration
              key={game.key}
              href={`/${locale}/teams/register/${game.key}`}
              gameKey={game.key}
              label={t.openLabel}
              title={t.openTitle}
              text={t.openText}
              cta={t.openCta}
            />
          ))}
        <EmptyState title={t.emptyTitle} text={t.emptyText}>
          <HudButton href={socials.discord} variant="night">
            {dict.empty.discord}
          </HudButton>
        </EmptyState>
        </div>
      </div>
    </main>
  );
}

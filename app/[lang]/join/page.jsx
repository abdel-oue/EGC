import { lang } from "next/root-params";
import Faq from "@/components/Faq";
import OpenRegistration from "@/components/OpenRegistration";
import PageHeader from "@/components/PageHeader";
import Steps from "@/components/Steps";
import { games } from "@/lib/site";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.join;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/join") };
}

export default async function JoinPage() {
  const locale = await lang();
  const dict = await getDictionary();
  const t = dict.pages.join;
  const game = games.find((g) => g.registration);

  return (
    <main>
      <PageHeader ghost={t.ghost} title={t.title} intro={t.intro} />
      <Steps dict={dict} />
      {game && (
        <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-8 lg:box-content lg:px-12">
          <OpenRegistration
            href={`/${locale}/teams/register/${game.key}`}
            gameKey={game.key}
            label={dict.pages.teams.openLabel}
            title={t.teamTitle}
            text={t.teamText}
            cta={t.teamCta}
          />
        </div>
      )}
      <Faq dict={dict} />
    </main>
  );
}

import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import PageHeader from "@/components/PageHeader";
import { games } from "@/lib/site";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../../dictionaries";
import { registerTeam } from "./actions";
import RegistrationForm from "./_components/RegistrationForm";

const openGames = games.filter((g) => g.registration);
const fill = (text, game) =>
  text.replace("{game}", game.name).replace("{players}", game.registration.players).replace("{subs}", game.registration.subs);

export function generateStaticParams() {
  return openGames.map((g) => ({ game: g.key }));
}

export async function generateMetadata({ params }) {
  const { game: key } = await params;
  const game = openGames.find((g) => g.key === key);
  if (!game) return {};
  const t = (await getDictionary()).register;
  return {
    title: fill(t.title, game),
    description: fill(t.intro, game),
    alternates: alternates(await lang(), `/teams/register/${game.key}`),
  };
}

export default async function RegisterPage({ params }) {
  const { game: key } = await params;
  const game = openGames.find((g) => g.key === key);
  if (!game) notFound();

  const locale = await lang();
  const t = (await getDictionary()).register;

  return (
    <main>
      <PageHeader ghost={t.ghost} title={fill(t.title, game)} intro={fill(t.intro, game)} />
      <section className="px-4 pb-24 sm:px-8 lg:px-12">
        <RegistrationForm
          action={registerTeam.bind(null, game.key)}
          lang={locale}
          t={t}
          config={game.registration}
          teamsHref={`/${locale}/teams`}
        />
      </section>
    </main>
  );
}

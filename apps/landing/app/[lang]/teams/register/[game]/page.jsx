import { redirect, notFound } from "next/navigation";
import { lang } from "next/root-params";
import { games } from "@/lib/site";

export function generateStaticParams() {
  return games.map((game) => ({ game: game.key }));
}

export default async function LegacyRegistration({ params }) {
  const { game } = await params;

  if (!games.some((item) => item.key === game)) {
    notFound();
  }

  redirect(`/${await lang()}/games/${game}#events`);
}

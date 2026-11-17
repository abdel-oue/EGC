import { lang } from "next/root-params";
import Faq from "@/components/Faq";
import { PageIntro, DiscordPanel, GamesBand } from "@/components/Editorial";
import { editorial } from "@/components/editorial-copy";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const dict = await getDictionary();
  const locale = await lang();
  return {
    title: dict.pages.join.title,
    description: editorial(locale).joinIntro,
    alternates: alternates(locale, "/join"),
  };
}
export default async function JoinPage() {
  const locale = await lang();
  const dict = await getDictionary();
  const t = editorial(locale);
  return (
    <main className="join-page">
      <PageIntro
        eyebrow={t.joinEyebrow}
        lines={t.joinLines}
        intro={t.joinIntro}
      />
      <DiscordPanel locale={locale} />
      <Faq dict={dict} locale={locale} compact />
      <GamesBand locale={locale} />
    </main>
  );
}

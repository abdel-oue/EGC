import { lang } from "next/root-params";
import Faq from "@/components/Faq";
import HudButton from "@/components/HudButton";
import PageHeader from "@/components/PageHeader";
import Steps from "@/components/Steps";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const dict = await getDictionary();

  return {
    title: dict.pages.join.title,
    description: dict.pages.join.intro,
    alternates: alternates(await lang(), "/join"),
  };
}

export default async function JoinPage() {
  const locale = await lang();
  const dict = await getDictionary();

  return (
    <main>
      <PageHeader {...dict.pages.join} />
      <Steps dict={dict} />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <HudButton href={`/${locale}/events`}>{dict.content.viewEvents}</HudButton>
      </div>
      <Faq dict={dict} />
    </main>
  );
}

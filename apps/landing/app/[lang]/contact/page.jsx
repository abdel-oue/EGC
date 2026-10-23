import { lang } from "next/root-params";
import HudButton from "@/components/HudButton";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Socials from "@/components/Socials";
import SubmissionForm from "@/components/SubmissionForm";
import { contact } from "@/lib/submissions";
import { email, socials } from "@/lib/site";
import { revealDelays } from "@/lib/motion";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.contact;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/contact") };
}

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=ESISA%20F%C3%A8s";

function Card({ title, text, dark, delay, children }) {
  return (
    <Reveal className={delay}>
      <article className={`chamfer flex h-full flex-col justify-between gap-8 p-8 ${dark ? "bg-night text-offwhite" : "bg-night/5"}`}>
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
          {text && <p className={`mt-2 ${dark ? "text-offwhite/70" : "text-night/60"}`}>{text}</p>}
        </div>
        {children}
      </article>
    </Reveal>
  );
}

export default async function ContactPage() {
  const dict = await getDictionary();
  const t = dict.pages.contact;
  const locale = await lang();

  return (
    <main>
      <PageHeader ghost={t.ghost} title={t.title} intro={t.intro} />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <SubmissionForm action={contact} locale={locale} labels={dict.content} />
      </div>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-24 sm:px-8 md:grid-cols-2 lg:box-content lg:px-12">
        <Card title={t.discordTitle} text={t.discordText} dark delay={revealDelays[0]}>
          <HudButton href={socials.discord} className="self-start">
            {t.discordCta}
          </HudButton>
        </Card>
        <Card title={t.socialsTitle} text={t.socialsText} delay={revealDelays[1]}>
          <Socials tileClass="bg-night text-offwhite hover:bg-accent" />
        </Card>
        {email && (
          <Card title={t.emailTitle} delay={revealDelays[2]}>
            <a href={`mailto:${email}`} className="self-start font-display text-xl font-bold text-accent underline-offset-4 hover:underline">
              {email}
            </a>
          </Card>
        )}
        <Card title={t.whereTitle} text={t.whereText} delay={revealDelays[3]}>
          <HudButton href={mapsUrl} variant="outline" className="self-start">
            {t.whereCta}
          </HudButton>
        </Card>
      </div>
    </main>
  );
}

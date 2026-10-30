import { notFound } from "next/navigation";
import { connection } from "next/server";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import { registrationOpen } from "@egc/shared/validation.js";
import PageHeader from "@/components/PageHeader";
import SubmissionForm from "@/components/SubmissionForm";
import Rules, { ruleSections } from "@/components/Rules";
import { getContent } from "@/lib/content";
import { registerEvent } from "@/lib/submissions";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../../dictionaries";

export { generateStaticParams } from "../page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const dict = await getDictionary();

  return {
    title: dict.content.signup,
    alternates: alternates(await lang(), `/events/${slug}/register`),
    robots: { index: false, follow: true },
  };
}

export default async function RegistrationPage({ params }) {
  await connection();
  const { slug } = await params;
  const { rows, unavailable } = await getContent("events");
  const dict = await getDictionary();
  const locale = await lang();
  const event = rows.find((item) => item.slug === slug);

  if (unavailable) {
    return <main className="p-12"><p role="status">{dict.content.unavailable}</p></main>;
  }

  if (!event) {
    notFound();
  }

  const rules = localized(event, "rules", locale).split("\n").map((rule) => rule.trim()).filter(Boolean);

  return (
    <main>
      <PageHeader ghost={dict.content.signup} title={localized(event, "title", locale)} intro={dict.content.signup} />
      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-24">
        {rules.length > 0 && (
          <section aria-labelledby="rules">
            <h2 id="rules" className="mb-4 font-display text-2xl font-bold uppercase">{dict.content.rulesTitle}</h2>
            <Rules sections={rules} />
          </section>
        )}
        {registrationOpen(event) ? (
          <SubmissionForm action={registerEvent.bind(null, event.id)} locale={locale} labels={dict.content} rankLabels={dict.register.ranks} event={event} />
        ) : <p role="status">{dict.content.closed}</p>}
      </div>
    </main>
  );
}

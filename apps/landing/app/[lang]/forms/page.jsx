import Link from "next/link";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import { formOpen } from "@egc/shared/validation.js";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { getContent } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata() {
  const t = (await getDictionary()).pages.forms;
  return { title: t.title, description: t.intro, alternates: alternates(await lang(), "/forms") };
}

export default async function FormsPage() {
  const dict = await getDictionary();
  const t = dict.pages.forms;
  const locale = await lang();
  const { rows, unavailable } = await getContent("forms");

  return (
    <main>
      <PageHeader {...t} />
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-label={t.title}>
        {unavailable ? <p role="status">{dict.content.unavailable}</p> : !rows.length ? (
          <EmptyState title={t.emptyTitle} text={t.emptyText} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {rows.map((form) => (
              <article key={form.id} className="brand-panel flex flex-col gap-5 border border-line bg-offwhite p-7">
                <h2 className="font-display text-2xl font-bold uppercase">{localized(form, "title", locale)}</h2>
                <p className="text-night/70">{localized(form, "description", locale)}</p>
                {formOpen(form) ? (
                  <Link href={`/${locale}/forms/${form.slug}`} className="mt-auto self-start bg-accent px-5 py-3 font-bold text-offwhite">
                    {t.fill}
                  </Link>
                ) : <p className="mt-auto font-bold">{t.closed}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

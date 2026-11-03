import Link from "next/link";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import { formOpen } from "@egc/shared/validation.js";
import DynamicForm from "@/components/DynamicForm";
import PageHeader from "@/components/PageHeader";
import { getContent } from "@/lib/content";
import { submitForm } from "@/lib/submissions";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { rows } = await getContent("forms");
  const form = rows.find((item) => item.slug === slug);
  const locale = await lang();

  return {
    title: form ? localized(form, "title", locale) : "EGC",
    description: form ? localized(form, "description", locale) : "",
    alternates: alternates(locale, `/forms/${slug}`),
  };
}

export default async function FormPage({ params }) {
  const { slug } = await params;
  const dict = await getDictionary();
  const t = dict.pages.forms;
  const locale = await lang();
  const { rows, unavailable } = await getContent("forms");
  const form = rows.find((item) => item.slug === slug);

  if (unavailable) {
    return <main className="p-12"><p role="status">{dict.content.unavailable}</p></main>;
  }

  if (!form) {
    notFound();
  }

  return (
    <main>
      <PageHeader ghost={t.ghost} title={localized(form, "title", locale)} intro={localized(form, "description", locale)} />
      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-24">
        <Link href={`/${locale}/forms`} className="inline-block font-bold underline decoration-accent underline-offset-8">{t.back}</Link>
        {formOpen(form) ? (
          <DynamicForm
            action={submitForm.bind(null, form.id)}
            form={form}
            locale={locale}
            labels={{ ...dict.content, closed: t.closed, duplicate: t.duplicate }}
          />
        ) : <p role="status">{t.closed}</p>}
      </div>
    </main>
  );
}

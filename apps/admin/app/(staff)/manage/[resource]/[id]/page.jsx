import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import t from "@egc/shared/admin.json";
import { resources } from "@egc/shared/resources.js";
import { requireStaff } from "@/lib/auth";
import { saveContent } from "@/lib/actions";
import ContentForm from "@/components/ContentForm";

export default async function EditContent({ params }) {
  const { resource, id } = await params;

  // Events are managed from their own pages.
  if (resource === "events") {
    redirect(id === "new" ? "/events/new" : `/events/${id}`);
  }
  const config = resources[resource];

  if (!config || (config.noCreate && id === "new")) {
    notFound();
  }

  const { client } = await requireStaff();
  let record = {};

  if (id !== "new") {
    const { data, error } = await client.from(config.table).select("*").eq("id", id).maybeSingle();

    if (error) {
      return <p role="alert">{t.unavailable}</p>;
    }

    if (!data) {
      notFound();
    }

    record = data;
  }

  const { data: events, error: eventError } = resource === "gallery"
    ? await client.from("events").select("id,title_fr").order("starts_at")
    : { data: [], error: null };

  if (eventError) {
    return <p role="alert">{t.unavailable}</p>;
  }

  return (
    <>
      <Link href={`/manage/${resource}`} className="mb-6 block underline">{t.back}</Link>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase">{t[resource]} — {id === "new" ? t.new : t.edit}</h1>
      <ContentForm resource={resource} record={record} events={events} action={saveContent.bind(null, resource, id === "new" ? null : id)} />
    </>
  );
}

import Link from "next/link";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { saveContent } from "@/lib/actions";
import ContentForm from "@/components/ContentForm";

export default async function NewEvent() {
  await requireStaff();

  return (
    <>
      <Link href="/events" className="mb-6 block underline">{t.back}</Link>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase">{t.newEvent}</h1>
      <ContentForm resource="events" record={{}} events={[]} action={saveContent.bind(null, "events", null)} backHref="/events" />
    </>
  );
}

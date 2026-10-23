import Link from "next/link";
import { notFound } from "next/navigation";
import t from "@egc/shared/admin.json";
import { submissions } from "@egc/shared/resources.js";
import { requireStaff } from "@/lib/auth";
import { updateSubmission } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

export default async function SubmissionDetail({ params }) {
  const { kind, id } = await params;
  const config = submissions[kind];

  if (!config) {
    notFound();
  }

  const { client } = await requireStaff();
  const { data: row, error } = await client.from(config.table).select("*").eq("id", id).maybeSingle();

  if (error) {
    return <p role="alert">{t.unavailable}</p>;
  }

  if (!row) {
    notFound();
  }

  const { data: event } = row.event_id
    ? await client.from("events").select("title_fr").eq("id", row.event_id).maybeSingle()
    : { data: null };

  return (
    <>
      <Link href={`/submissions/${kind}`} className="mb-6 block underline">{t.back}</Link>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase">{t[kind]}</h1>
      {event && <p className="mb-6 font-bold">{event.title_fr}</p>}
      <dl className="mb-10 grid max-w-4xl gap-5 border border-line bg-panel p-6">
        {Object.entries(row).filter(([key]) => key !== "status").map(([key, value]) => (
          <div key={key}>
            <dt className="mb-1 font-bold">{t[key] || key}</dt>
            <dd className="whitespace-pre-wrap break-words">
              {Array.isArray(value) ? value.map((player, index) => (
                <p key={index} className="mb-3 border-l-2 border-accent pl-4">
                  {player.name} · {player.handle || player.riot_id} {player.rank && `· ${player.rank}`} {player.sub && `(${t.options.team} +)`}
                </p>
              )) : typeof value === "boolean" ? value ? t.yes : t.no : String(value ?? "—")}
            </dd>
          </div>
        ))}
      </dl>
      <div className="max-w-md">
        <ActionForm action={updateSubmission.bind(null, kind, id)}>
          <label className="block">
            <span className="mb-2 block font-bold">{t.status}</span>
            <select name="status" defaultValue={row.status}>
              {config.statuses.map((status) => <option key={status} value={status}>{t.options[status]}</option>)}
            </select>
          </label>
        </ActionForm>
      </div>
    </>
  );
}

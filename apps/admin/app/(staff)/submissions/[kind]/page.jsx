import Link from "next/link";
import { notFound } from "next/navigation";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { submissions } from "@egc/shared/resources.js";
import { requireStaff } from "@/lib/auth";

export default async function SubmissionList({ params, searchParams }) {
  const { kind } = await params;
  const config = submissions[kind];

  if (!config) {
    notFound();
  }

  const { client } = await requireStaff();
  const { q = "", status = "", event = "", page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Math.min(10000, Number.parseInt(page, 10) || 1));
  const searchField = kind === "legacy" ? "captain_email" : "email";
  let query = client.from(config.table).select("*", { count: "exact" })
    .order("created_at", { ascending: false }).order("id")
    .range((pageNumber - 1) * 30, pageNumber * 30 - 1);

  if (q) {
    query = query.ilike(searchField, `%${String(q).slice(0, 120)}%`);
  }

  if (config.statuses.includes(status)) {
    query = query.eq("status", status);
  }

  if (kind === "registrations" && /^[0-9a-f-]{36}$/i.test(event)) {
    query = query.eq("event_id", event);
  }

  const { data: rows, count, error } = await query;
  const { data: events } = kind === "registrations"
    ? await client.from("events").select("id,title_fr").order("starts_at")
    : { data: [] };
  const filters = new URLSearchParams({ q, status, event });

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase">{t[kind]}</h1>
      {kind === "legacy" && <p className="mb-6">{t.legacyNote}</p>}
      <form className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="mb-2 block">{t.email}</span>
          <input name="q" defaultValue={q} maxLength={120} />
        </label>
        <label>
          <span className="mb-2 block">{t.status}</span>
          <select name="status" defaultValue={status}>
            <option value="">{t.all}</option>
            {config.statuses.map((value) => <option key={value} value={value}>{t.options[value]}</option>)}
          </select>
        </label>
        {kind === "registrations" && (
          <label>
            <span className="mb-2 block">{t.events}</span>
            <select name="event" defaultValue={event}>
              <option value="">{t.all}</option>
              {events?.map((item) => <option key={item.id} value={item.id}>{item.title_fr}</option>)}
            </select>
          </label>
        )}
        <button type="submit" className="self-end border border-line px-5 py-3">{t.filter}</button>
      </form>
      {error && <p role="alert">{t.unavailable}</p>}
      {!error && !rows?.length && <p>{t.empty}</p>}
      <ul className="divide-y divide-line border border-line">
        {rows?.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-5 bg-panel p-5">
            <div>
              <p className="break-all font-bold">{row.subject || row.team_name || row.name}</p>
              <p className="break-all">{row[searchField]}</p>
              <p className="text-sm">{eventDate(row.created_at)} · {t.options[row.status]}</p>
              {row.event_id && <p className="text-sm">{events?.find((item) => item.id === row.event_id)?.title_fr}</p>}
            </div>
            <Link href={`/submissions/${kind}/${row.id}`} className="font-bold text-accent underline">{t.details}</Link>
          </li>
        ))}
      </ul>
      <nav className="mt-8 flex gap-8" aria-label={t.filter}>
        {pageNumber > 1 && <Link href={`?${filters}&page=${pageNumber - 1}`}>{t.previous}</Link>}
        {pageNumber * 30 < count && <Link href={`?${filters}&page=${pageNumber + 1}`}>{t.next}</Link>}
      </nav>
    </>
  );
}

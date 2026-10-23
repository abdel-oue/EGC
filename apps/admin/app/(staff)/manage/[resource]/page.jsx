import Link from "next/link";
import { notFound } from "next/navigation";
import t from "@egc/shared/admin.json";
import { resources } from "@egc/shared/resources.js";
import { requireStaff } from "@/lib/auth";

export default async function ContentList({ params, searchParams }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) {
    notFound();
  }

  const { client } = await requireStaff();
  const { q = "", page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Math.min(10000, Number.parseInt(page, 10) || 1));
  const titleField = resource === "events" ? "title_fr" : resource === "members" ? "name" : "caption_fr";
  let query = client.from(config.table).select("*", { count: "exact" })
    .order(resource === "events" ? "starts_at" : "sort_order").order("id")
    .range((pageNumber - 1) * 30, pageNumber * 30 - 1);

  if (q) {
    query = query.ilike(titleField, `%${String(q).slice(0, 100)}%`);
  }

  const { data: rows, error, count } = await query;

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-5">
        <h1 className="font-display text-3xl font-bold uppercase">{t[resource]}</h1>
        <Link href={`/manage/${resource}/new`} className="bg-accent px-5 py-3 font-bold text-offwhite">{t.new}</Link>
      </div>
      {resource === "events" && <p className="mb-6">{t.draftNote}</p>}
      <form className="mb-8 flex gap-3">
        <input name="q" defaultValue={q} placeholder={t.search} aria-label={t.search} maxLength={100} />
        <button className="border border-line px-5">{t.filter}</button>
      </form>
      {error && <p role="alert">{t.unavailable}</p>}
      {!error && !rows?.length && <p>{t.empty}</p>}
      <ul className="divide-y divide-line border border-line">
        {rows?.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-4 bg-panel p-5">
            <div>
              <p className="font-bold">{row[titleField]}</p>
              <p className="text-sm">{row.status ? t.options[row.status] : row.visible ? t.yes : t.no}</p>
            </div>
            <Link href={`/manage/${resource}/${row.id}`} className="font-bold text-accent underline">{t.edit}</Link>
          </li>
        ))}
      </ul>
      <nav className="mt-8 flex gap-8" aria-label={t.filter}>
        {pageNumber > 1 && <Link href={`?q=${encodeURIComponent(q)}&page=${pageNumber - 1}`}>{t.previous}</Link>}
        {pageNumber * 30 < count && <Link href={`?q=${encodeURIComponent(q)}&page=${pageNumber + 1}`}>{t.next}</Link>}
      </nav>
    </>
  );
}

import Link from "next/link";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { requireStaff } from "@/lib/auth";

export default async function ActivityPage({ searchParams }) {
  const { client } = await requireStaff();
  const { page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Math.min(10000, Number.parseInt(page, 10) || 1));
  const { data: rows, error, count } = await client.from("activity_log")
    .select("*", { count: "exact" }).order("id", { ascending: false })
    .range((pageNumber - 1) * 50, pageNumber * 50 - 1);
  const { data: profiles } = await client.from("staff_profiles").select("user_id,email");

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-bold uppercase">{t.activity}</h1>
      <p className="mb-8">{t.activityNote}</p>
      {error && <p role="alert">{t.unavailable}</p>}
      {!error && !rows?.length && <p>{t.empty}</p>}
      <ol className="divide-y divide-line border border-line">
        {rows?.map((row) => (
          <li key={row.id} className="space-y-2 bg-panel p-5">
            <p className="font-bold">{row.entity} · {row.action}</p>
            <p className="break-all text-sm">{profiles?.find((profile) => profile.user_id === row.actor_id)?.email || row.actor_id || "Import"} · {eventDate(row.created_at)}</p>
            <p className="break-all text-sm text-night/60">{row.entity_id}</p>
          </li>
        ))}
      </ol>
      <nav className="mt-8 flex gap-8" aria-label={t.filter}>
        {pageNumber > 1 && <Link href={`?page=${pageNumber - 1}`}>{t.previous}</Link>}
        {pageNumber * 50 < count && <Link href={`?page=${pageNumber + 1}`}>{t.next}</Link>}
      </nav>
    </>
  );
}

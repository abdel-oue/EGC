import Link from "next/link";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";

export default async function Dashboard() {
  const { client } = await requireStaff();
  const categories = [
    ["contacts", "contact_messages", "/submissions/contacts"],
    ["registrations", "event_registrations", "/submissions/registrations"],
    ["events", "events", "/manage/events"],
    ["members", "members", "/manage/members"],
  ];
  const results = await Promise.all(categories.map(async ([label, table, href]) => {
    const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
    return { label, href, count, error };
  }));

  return (
    <>
      <h1 className="mb-10 font-display text-4xl font-bold uppercase">{t.dashboard}</h1>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {results.map((item) => (
          <Link href={item.href} key={item.label} className="border border-line bg-panel p-7">
            <span className="block font-display text-5xl font-bold text-accent">{item.error ? "—" : item.count}</span>
            <span className="mt-5 block font-bold">{t[item.label]}</span>
          </Link>
        ))}
      </div>
      {results.some((item) => item.error) && <p role="alert" className="mt-8">{t.unavailable}</p>}
    </>
  );
}

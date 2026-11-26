import { notFound } from "next/navigation";
import t from "@egc/shared/admin.json";
import { requireStaff } from "@/lib/auth";
import { entryName } from "@/components/BracketPanel";
import DrawShow from "@/components/DrawShow";

export const metadata = { robots: { index: false, follow: false } };

// Full-screen draw for the projector, outside the staff top bar.
export default async function DrawPage({ params }) {
  const { id } = await params;
  const { client } = await requireStaff();

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  const [{ data: event, error }, { data: entries }, { data: matches }] = await Promise.all([
    client.from("events").select("title_fr").eq("id", id).maybeSingle(),
    client.from("event_registrations").select("id,name,team_name,players").eq("event_id", id).eq("status", "approved"),
    client.from("event_matches").select("position,team_a,team_b").eq("event_id", id).eq("round", 1).order("position"),
  ]);

  if (error) {
    return <p role="alert">{t.unavailable}</p>;
  }

  if (!event) {
    notFound();
  }

  const names = new Map((entries || []).map((entry) => [entry.id, entryName(entry)]));

  return (
    <DrawShow
      title={event.title_fr}
      matches={(matches || []).map((match) => ({ a: names.get(match.team_a) || t.tbd, b: match.team_b ? names.get(match.team_b) : null }))}
    />
  );
}

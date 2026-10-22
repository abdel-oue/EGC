// ponytail: plain REST insert with fetch, no SDK. Switch to @supabase/ssr when we need reads or auth.
// Uses the publishable key: Row Level Security decides what it may do (see supabase/migrations/).
export async function insertRow(table, row) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { error: "unavailable" };

  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (res.ok) return {};
    const body = await res.json().catch(() => ({}));
    console.error(`Supabase insert into ${table} failed`, res.status, body);
    return { error: body.code === "23505" ? "duplicate" : "server" };
  } catch (err) {
    console.error(`Supabase insert into ${table} failed`, err);
    return { error: "server" };
  }
}

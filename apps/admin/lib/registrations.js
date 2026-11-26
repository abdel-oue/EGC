import { schoolDomain } from "@egc/shared/validation.js";

export function isEsisa(row) {
  return row.email.endsWith(schoolDomain);
}

// Per-event counters (pending + approved count as taken places; ESISA entries are free).
export function eventStats(rows = []) {
  const active = rows.filter((row) => row.status !== "rejected");

  return {
    taken: active.length,
    toReview: rows.filter((row) => row.status === "pending").length,
    unpaid: active.filter((row) => !isEsisa(row) && !row.paid).length,
    present: active.filter((row) => row.checked_in_at).length,
  };
}


// Events from yesterday on are still "upcoming" on the dashboard (an event day is not over at its start).
export function upcomingSince() {
  return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
}

export function splitEvents(events = []) {
  const now = Date.now();

  return {
    upcoming: events.filter((event) => Date.parse(event.starts_at) >= now).reverse(),
    past: events.filter((event) => Date.parse(event.starts_at) < now),
  };
}

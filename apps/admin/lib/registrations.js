import { schoolDomain } from "@egc/shared/validation.js";

export function isEsisa(row) {
  return row.email.endsWith(schoolDomain);
}

// Pending + approved entries take a place; the waiting list and rejected entries do not.
export function takesPlace(row) {
  return row.status === "pending" || row.status === "approved";
}

// Per-event counters (ESISA entries are free).
export function eventStats(rows = []) {
  const active = rows.filter(takesPlace);

  return {
    taken: active.length,
    waitlist: rows.filter((row) => row.status === "waitlisted").length,
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

// Entries that lost a decided match and have nothing left to play
// (semi-final losers stay in until their match for 3rd place is decided).
export function eliminated(matches = []) {
  const playing = new Set(matches.filter((match) => !match.winner).flatMap((match) => [match.team_a, match.team_b]));

  return matches
    .filter((match) => match.winner)
    .map((match) => (match.winner === match.team_a ? match.team_b : match.team_a))
    .filter((team) => team && !playing.has(team));
}

export function deadlinePassed(date) {
  return Boolean(date) && Date.parse(date) < Date.now();
}

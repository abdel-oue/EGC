"use server";

import { games } from "@/lib/site";
import { validateRegistration } from "@/lib/registration";
import { insertRow } from "@/lib/supabase/server";

// Bound to a game key by the page: registerTeam.bind(null, "valorant").
// Returns { ok } or { error, errors } — errors maps field names to error codes.
export async function registerTeam(gameKey, _previous, form) {
  const game = games.find((g) => g.key === gameKey && g.registration);
  if (!game) return { error: "server" };

  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (form.get("website")) return { ok: true };

  const { errors, data } = validateRegistration(form, game.registration);
  if (Object.keys(errors).length) return { error: "form", errors };

  const { error } = await insertRow("team_registrations", {
    ...data,
    game: game.key,
    locale: form.get("lang") === "en" ? "en" : "fr",
  });
  if (error) return { error, errors: error === "duplicate" ? { teamName: "duplicate" } : {} };

  return { ok: true };
}

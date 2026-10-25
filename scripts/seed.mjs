import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  throw new Error("Load NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before running the seed.");
}

const client = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const root = path.resolve(import.meta.dirname, "..");
const content = JSON.parse(await readFile(path.join(root, "packages/shared/initial-content.json"), "utf8"));
const french = JSON.parse(await readFile(path.join(root, "packages/shared/dictionaries/fr.json"), "utf8"));
const english = JSON.parse(await readFile(path.join(root, "packages/shared/dictionaries/en.json"), "utf8"));

function check(result) {
  if (result.error) {
    throw result.error;
  }
}

// Insert-only imports preserve subsequent editorial changes on repeated runs.
for (const [table, rows] of [["members", content.members], ["gallery_media", content.media]]) {
  for (const row of rows) {
    const existing = await client.from(table).select("id").eq("id", row.id).maybeSingle();
    check(existing);

    if (existing.data) {
      continue;
    }

    const file = await readFile(path.join(root, "packages/shared/preview-media", row.image_path));
    check(await client.storage.from("club-media").upload(row.image_path, file, {
      contentType: row.image_path.endsWith(".png") ? "image/png" : "image/jpeg",
      upsert: false,
    }).then((result) => Number(result.error?.statusCode) === 409 ? { error: null } : result));
    check(await client.from(table).insert(row));
  }
}

const dates = ["2026-11-01", "2026-12-01", "2027-01-01", "2027-03-01", "2027-04-01", "2027-05-01"];
const games = [null, "valorant", "league", "fc", "minecraft", null];
const slugs = ["lancement-2026", "valorant-decembre-2026", "league-2027", "fc-2027", "minecraft-2027", "lan-2027"];
const events = french.season.items.map((item, index) => ({
  slug: slugs[index],
  title_fr: item.name,
  title_en: english.season.items[index].name,
  description_fr: `Date indicative : ${item.date}. À confirmer par le bureau.`,
  description_en: `Tentative date: ${english.season.items[index].date}. Pending staff confirmation.`,
  starts_at: `${dates[index]}T18:00:00+01:00`,
  game: games[index],
  status: "draft",
  registration_enabled: false,
}));
events.push({
  slug: "valorant-skirmish-2v2-31-octobre-2026",
  title_fr: "Tournoi Valorant — Skirmish 2v2",
  title_en: "Valorant tournament — Skirmish 2v2",
  description_fr: "Tournoi Valorant en équipes de deux joueurs, sans remplaçant. Début samedi 31 octobre à 20:00. Diffusion sur Twitch.",
  description_en: "Valorant tournament for teams of two players, no substitutes. Starts Saturday 31 October at 20:00. Streamed on Twitch.",
  rules_fr: [
    "Aucune triche : logiciels tiers, exploits et partage de compte sont interdits.",
    "Respect et fair-play envers tous les joueurs et les organisateurs.",
    "Chaque équipe compte exactement deux joueurs, sans remplaçant.",
    "Les décisions des organisateurs sont définitives.",
  ].join("\n"),
  rules_en: [
    "No cheating: third-party software, exploits and account sharing are forbidden.",
    "Respect and fair play towards all players and organizers.",
    "Each team has exactly two players, no substitutes.",
    "Organizers' decisions are final.",
  ].join("\n"),
  starts_at: "2026-10-31T20:00:00+01:00",
  game: "valorant",
  status: "published",
  entry_type: "team",
  player_count: 2,
  substitute_count: 0,
  registration_enabled: true,
});
for (const event of events) {
  check(await client.from("events").upsert(event, { onConflict: "slug", ignoreDuplicates: true }));
}
console.log("Members, media, and draft events imported. Existing records were preserved.");

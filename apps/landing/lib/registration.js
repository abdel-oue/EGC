// Server-side validation of a team registration form. This is the trust boundary:
// browser checks (required, pattern…) are only for UX and can be bypassed.
// Returns { errors: { fieldName: errorCode }, data } — data matches the team_registrations table.

const TAG = /^[A-Za-z0-9]{2,5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ]{8,20}$/;
const RIOT_ID = /^[^#]{3,16}#[A-Za-z0-9]{3,5}$/;

const between = (min, max) => (v) => v.length >= min && v.length <= max;

export function validateRegistration(form, config) {
  const errors = {};
  const text = (key) => String(form.get(key) ?? "").trim();
  const field = (key, isValid, code) => {
    const value = text(key);
    if (!value) errors[key] = "required";
    else if (!isValid(value)) errors[key] = code;
    return value;
  };

  const data = {
    team_name: field("teamName", between(2, 40), "length"),
    team_tag: field("teamTag", (v) => TAG.test(v), "tag").toUpperCase(),
    captain_name: field("captainName", between(2, 60), "length"),
    captain_email: field("captainEmail", (v) => EMAIL.test(v) && v.length <= 120, "email").toLowerCase(),
    captain_phone: field("captainPhone", (v) => PHONE.test(v), "phone"),
    captain_discord: field("captainDiscord", between(2, 37), "length"),
    players: [],
    rules_accepted: form.get("rules") === "on",
  };

  const seen = new Set();
  for (let i = 0; i < config.players + config.subs; i++) {
    const isSub = i >= config.players;
    // Subs are optional: skip a sub slot left completely empty.
    if (isSub && !text(`p${i}name`) && !text(`p${i}riot`) && !text(`p${i}rank`)) continue;

    const riotId = field(`p${i}riot`, (v) => RIOT_ID.test(v), "riotId");
    if (riotId && seen.has(riotId.toLowerCase())) errors[`p${i}riot`] ??= "duplicateRiot";
    seen.add(riotId.toLowerCase());

    data.players.push({
      name: field(`p${i}name`, between(2, 60), "length"),
      riot_id: riotId,
      rank: field(`p${i}rank`, (v) => config.ranks.includes(v), "rank"),
      sub: isSub,
    });
  }

  if (!data.rules_accepted) errors.rules = "rules";
  return { errors, data };
}

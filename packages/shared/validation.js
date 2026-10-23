const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const riotPattern = /^[^#]{3,16}#[A-Za-z0-9]{3,5}$/;
export const ranks = [
  "iron", "bronze", "silver", "gold", "platinum",
  "diamond", "ascendant", "immortal", "radiant",
];

export function text(form, key) {
  return String(form.get(key) ?? "").trim();
}

function field(errors, form, key, min, max) {
  const value = text(form, key);

  if (value.length < min || value.length > max) {
    errors[key] = "invalid";
  }

  return value;
}

export function validateContact(form) {
  const errors = {};
  const data = {
    name: field(errors, form, "name", 2, 80),
    email: field(errors, form, "email", 3, 120).toLowerCase(),
    subject: field(errors, form, "subject", 3, 150),
    message: field(errors, form, "message", 10, 5000),
    locale: text(form, "locale") === "en" ? "en" : "fr",
  };

  if (!emailPattern.test(data.email)) {
    errors.email = "invalid";
  }

  return { data, errors };
}

export function registrationOpen(event, now = Date.now()) {
  return Boolean(
    event && event.status === "published" && event.registration_enabled &&
    new Date(event.starts_at).getTime() > now &&
    (!event.registration_opens_at || new Date(event.registration_opens_at).getTime() <= now) &&
    (!event.registration_closes_at || new Date(event.registration_closes_at).getTime() > now)
  );
}

export function validateEventRegistration(form, event, now = Date.now()) {
  const errors = {};

  if (!registrationOpen(event, now)) {
    return { data: null, errors: { form: "closed" } };
  }

  const data = {
    event_id: event.id,
    name: field(errors, form, "name", 2, 80),
    email: field(errors, form, "email", 3, 120).toLowerCase(),
    discord: field(errors, form, "discord", 2, 80),
    team_name: event.entry_type === "team"
      ? field(errors, form, "team_name", 2, 80)
      : null,
    locale: text(form, "locale") === "en" ? "en" : "fr",
    rules_accepted: form.get("rules") === "on",
    players: [],
  };

  if (!emailPattern.test(data.email)) {
    errors.email = "invalid";
  }

  if (!data.rules_accepted) {
    errors.rules = "invalid";
  }

  const required = event.entry_type === "individual" ? 1 : event.player_count;
  const seen = new Set();

  for (let index = 0; index < required + event.substitute_count; index += 1) {
    const prefix = `player_${index}_`;
    const optional = index >= required;
    const hasValue = ["name", "handle", "rank"].some((key) => text(form, prefix + key));

    if (optional && !hasValue) {
      continue;
    }

    const player = {
      name: field(errors, form, prefix + "name", 2, 80),
      handle: field(errors, form, prefix + "handle", 2, 80),
      sub: optional,
    };

    if (event.game === "valorant") {
      player.rank = text(form, prefix + "rank");

      if (!riotPattern.test(player.handle)) {
        errors[prefix + "handle"] = "invalid";
      }

      if (!ranks.includes(player.rank)) {
        errors[prefix + "rank"] = "invalid";
      }
    }

    const normalized = player.handle.toLowerCase();

    if (seen.has(normalized)) {
      errors[prefix + "handle"] = "duplicate";
    }

    seen.add(normalized);
    data.players.push(player);
  }

  return { data, errors };
}

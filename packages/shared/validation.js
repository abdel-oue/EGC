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

// registration_count is the public computed column (pending + approved entries).
// A full event stays open: new entries join the waiting list.
export function registrationFull(event) {
  return Boolean(event && event.max_registrations != null &&
    (event.registration_count ?? 0) >= event.max_registrations);
}

export function registrationOpen(event, now = Date.now()) {
  return Boolean(
    event && event.status === "published" && event.registration_enabled &&
    new Date(event.starts_at).getTime() > now &&
    (!event.registration_opens_at || new Date(event.registration_opens_at).getTime() <= now) &&
    (!event.registration_closes_at || new Date(event.registration_closes_at).getTime() > now)
  );
}

export const formLimits = { text: 200, textarea: 5000 };
const phonePattern = /^\+[1-9]\d{7,14}$/;
export const schoolDomain = "@esisa.ac.ma";

export function normalizePhone(value) {
  // Local Moroccan mobiles (06…, 07…) become +212….
  return value.replace(/[\s().-]/g, "").replace(/^00/, "+").replace(/^0(?=[5-7]\d{8}$)/, "+212");
}

export function emailAllowed(event, email) {
  return emailPattern.test(email) && (event.allow_any_email || email.endsWith(schoolDomain));
}

// Solo events outside Valorant need no roster: the registrant is the entry.
export function needsRoster(event) {
  return event.entry_type === "team" || event.game === "valorant";
}

export function formOpen(definition, now = Date.now()) {
  return Boolean(
    definition && definition.status === "published" &&
    (!definition.closes_at || new Date(definition.closes_at).getTime() > now)
  );
}

export function validateForm(form, definition, now = Date.now()) {
  if (!formOpen(definition, now)) {
    return { data: null, errors: { form: "closed" } };
  }

  const errors = {};
  const answers = {};

  for (const { name, type, required, options } of definition.fields) {
    const value = type === "phone"
      ? normalizePhone(text(form, name))
      : text(form, name);

    if (!value) {
      if (required) {
        errors[name] = "invalid";
      }

      continue;
    }

    const valid = type === "phone" ? phonePattern.test(value)
      : type === "choice" ? options.some((option) => option.value === value)
      : type === "consent" ? value === "on"
      : value.length <= formLimits[type];

    if (!valid) {
      errors[name] = "invalid";
    }

    answers[name] = type === "consent" ? value === "on" : value;
  }

  return {
    data: { form_id: definition.id, answers, locale: text(form, "locale") === "en" ? "en" : "fr" },
    errors,
  };
}

export function validateEventRegistration(form, event, now = Date.now()) {
  const errors = {};

  if (!registrationOpen(event, now)) {
    return { data: null, errors: { form: "closed" } };
  }

  const team = event.entry_type === "team";
  const data = {
    event_id: event.id,
    name: field(errors, form, "name", 2, 80),
    email: field(errors, form, "email", 3, 120).toLowerCase(),
    phone: normalizePhone(text(form, "phone")),
    code: text(form, "code"),
    discord: team ? field(errors, form, "discord", 2, 80) : null,
    team_name: team ? field(errors, form, "team_name", 2, 80) : null,
    locale: text(form, "locale") === "en" ? "en" : "fr",
    rules_accepted: form.get("rules") === "on",
    players: [],
  };

  if (!emailPattern.test(data.email)) {
    errors.email = "invalid";
  } else if (!emailAllowed(event, data.email)) {
    errors.email = "domain";
  }

  if (!phonePattern.test(data.phone)) {
    errors.phone = "invalid";
  }

  // School: "esisa" or "other" + its name. School-address-only events are ESISA by definition.
  // Choosing ESISA (free entry) requires the school address.
  const school = event.allow_any_email ? text(form, "school") : "esisa";

  if (school === "esisa") {
    data.school = "ESISA";

    if (!errors.email && !data.email.endsWith(schoolDomain)) {
      errors.email = "domain";
    }
  } else if (school === "other") {
    data.school = field(errors, form, "school_other", 2, 120);
  } else {
    errors.school = "invalid";
  }

  // The code is only checked on the confirmation step.
  if (text(form, "intent") === "confirm" && !/^\d{6}$/.test(data.code)) {
    errors.code = "invalid";
  }

  if (!data.rules_accepted) {
    errors.rules = "invalid";
  }

  if (!needsRoster(event)) {
    data.players.push({ name: data.name, handle: data.name, sub: false });
    return { data, errors };
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

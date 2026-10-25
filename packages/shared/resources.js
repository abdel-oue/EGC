export const gameKeys = ["valorant", "minecraft", "league", "fc"];

export const resources = {
  events: {
    table: "events",
    fields: [
      ["slug", "slug", true],
      ["game", "select", false, gameKeys],
      ["title_fr", "text", true],
      ["title_en", "text"],
      ["description_fr", "textarea"],
      ["description_en", "textarea"],
      ["rules_fr", "textarea"],
      ["rules_en", "textarea"],
      ["starts_at", "datetime-local", true],
      ["location", "text", true],
      ["status", "select", true, ["draft", "published", "archived"]],
      ["registration_enabled", "checkbox"],
      ["registration_opens_at", "datetime-local"],
      ["registration_closes_at", "datetime-local"],
      ["entry_type", "select", true, ["individual", "team"]],
      ["player_count", "number", true],
      ["substitute_count", "number", true],
    ],
    defaults: { status: "draft", entry_type: "individual", player_count: 1, substitute_count: 0, location: "ESISA, Fès" },
  },
  members: {
    table: "members",
    fields: [
      ["name", "text", true],
      ["role_fr", "text", true],
      ["role_en", "text"],
      ["photo_offset_y", "select", true, ["-100", "-80", "0", "90"]],
      ["sort_order", "number", true],
      ["visible", "checkbox"],
    ],
    defaults: { photo_offset_y: 0, sort_order: 0, visible: true },
    image: true,
  },
  gallery: {
    table: "gallery_media",
    fields: [
      ["game", "select", false, gameKeys],
      ["event_id", "event"],
      ["caption_fr", "text", true],
      ["caption_en", "text"],
      ["kind", "select", true, ["photo", "promotion"]],
      ["sort_order", "number", true],
      ["visible", "checkbox"],
    ],
    defaults: { kind: "photo", sort_order: 0, visible: false },
    image: true,
  },
};

export const submissions = {
  contacts: { table: "contact_messages", statuses: ["new", "in-progress", "resolved"] },
  registrations: { table: "event_registrations", statuses: ["pending", "approved", "rejected"] },
  legacy: { table: "team_registrations", statuses: ["pending", "approved", "rejected"] },
};

export function validateResource(resource, data) {
  const errors = {};
  const config = resources[resource];

  if (!config) {
    return { form: "invalid" };
  }

  for (const [name, type, required, options] of config.fields) {
    const value = data[name];

    if (required && (value === "" || value === null || value === undefined)) {
      errors[name] = "invalid";
    }

    if (type === "select" && value !== null && !options.includes(String(value))) {
      errors[name] = "invalid";
    }

    if (type === "number" && (!Number.isInteger(value) || Math.abs(value) > 10000)) {
      errors[name] = "invalid";
    }

    if (typeof value === "string" && value.length > (type === "textarea" ? 10000 : 200)) {
      errors[name] = "invalid";
    }
  }

  if (resource === "events") {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug || "")) {
      errors.slug = "invalid";
    }

    if (!data.starts_at || !Number.isFinite(Date.parse(data.starts_at))) {
      errors.starts_at = "invalid";
    }

    if (data.player_count < 1 || data.player_count > 20 ||
      data.substitute_count < 0 || data.substitute_count > 5 ||
      (data.entry_type === "individual" && data.player_count !== 1)) {
      errors.player_count = "invalid";
    }

    if (data.registration_opens_at && data.registration_closes_at &&
      Date.parse(data.registration_opens_at) >= Date.parse(data.registration_closes_at)) {
      errors.registration_closes_at = "invalid";
    }

    if (data.registration_closes_at && Date.parse(data.registration_closes_at) > Date.parse(data.starts_at)) {
      errors.registration_closes_at = "invalid";
    }
  }

  return errors;
}

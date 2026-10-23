"use server";

import { publicClient } from "@egc/shared/supabase.js";
import { validateContact, validateEventRegistration } from "@egc/shared/validation.js";

function result(error) {
  if (!error) {
    return { ok: true };
  }

  const codes = { "23505": "duplicate", P0002: "closed", P0001: "limited", "22023": "formError" };
  return { error: codes[error.code] || "server" };
}

export async function contact(_previous, form) {
  if (form.get("website")) {
    return { ok: true };
  }

  const { data, errors } = validateContact(form);

  if (Object.keys(errors).length) {
    return { error: "formError", errors };
  }

  const client = publicClient();

  if (!client) {
    return { error: "unavailableForm" };
  }

  const { error } = await client.rpc("submit_contact", { payload: data });
  return result(error);
}

export async function registerEvent(eventId, _previous, form) {
  if (form.get("website")) {
    return { ok: true };
  }

  const client = publicClient();

  if (!client) {
    return { error: "unavailableForm" };
  }

  const { data: event, error: readError } = await client.from("events")
    .select("*").eq("id", eventId).maybeSingle();

  if (readError) {
    return { error: "server" };
  }

  const { data, errors } = validateEventRegistration(form, event);

  if (Object.keys(errors).length) {
    return { error: errors.form || "formError", errors };
  }

  const { error } = await client.rpc("submit_event_registration", { payload: data });
  return result(error);
}

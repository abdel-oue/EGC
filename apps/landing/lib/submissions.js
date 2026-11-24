"use server";

import { publicClient } from "@egc/shared/supabase.js";
import { text, validateContact, validateEventRegistration, validateForm } from "@egc/shared/validation.js";
import fr from "@egc/shared/dictionaries/fr.json";
import en from "@egc/shared/dictionaries/en.json";
import { codeEmail, codeSlot, registrationCode, sendEmail } from "@/lib/email-code";
import { siteUrl } from "@/lib/site";

function result(error) {
  if (!error) {
    return { ok: true };
  }

  const codes = { "23505": "duplicate", P0002: "closed", P0001: "limited", P0003: "domain", "22023": "formError" };
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

export async function submitForm(formId, _previous, form) {
  if (form.get("website")) {
    return { ok: true };
  }

  const client = publicClient();

  if (!client) {
    return { error: "unavailableForm" };
  }

  const { data: definition, error: readError } = await client.from("forms")
    .select("*").eq("id", formId).maybeSingle();

  if (readError) {
    return { error: "server" };
  }

  const { data, errors } = validateForm(form, definition);

  if (Object.keys(errors).length) {
    return { error: errors.form || "formError", errors };
  }

  const { error } = await client.rpc("submit_form", { payload: data });
  return result(error);
}

async function readEvent(client, eventId) {
  const { data, error } = await client.from("events").select("*").eq("id", eventId).maybeSingle();
  return error ? null : data;
}

// Step 1 (and "resend"): reserve a send in the database, then email the code.
async function sendCode(client, event, data) {
  const secret = process.env.REGISTRATION_CODE_SECRET;

  if (!secret || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return { error: "unavailableForm" };
  }

  const { error } = await client.rpc("request_registration_code", { target_event: event.id, address: data.email });

  if (error) {
    return result(error);
  }

  const english = data.locale === "en";
  const sent = await sendEmail({
    to: data.email,
    ...codeEmail({
      code: await registrationCode(secret, data.email, event.id, codeSlot()),
      event: english ? event.title_en || event.title_fr : event.title_fr,
      copy: (english ? en : fr).content,
      siteUrl: `${siteUrl}/${data.locale}`,
      logoUrl: `${siteUrl}/brand/logo-email.png`,
    }),
  });

  return sent ? { verify: data.email } : { error: "server" };
}

// Submit sends a code; the verification step submits the same form again with intent=confirm.
export async function registerEvent(eventId, _previous, form) {
  if (form.get("website")) {
    return { ok: true };
  }

  const client = publicClient();

  if (!client) {
    return { error: "unavailableForm" };
  }

  const event = await readEvent(client, eventId);

  if (!event) {
    return { error: "closed" };
  }

  const intent = text(form, "intent");
  const { data, errors } = validateEventRegistration(form, event);

  if (Object.keys(errors).length) {
    const codeOnly = Object.keys(errors).every((key) => key === "code");
    return codeOnly ? { verify: data.email, error: "codeError", errors } : { error: errors.form || "formError", errors };
  }

  if (intent !== "confirm") {
    const sent = await sendCode(client, event, data);
    // A failed resend keeps the visitor on the verification step.
    return intent === "resend" && sent.error ? { ...sent, verify: data.email } : sent;
  }

  const { data: outcome, error } = await client.rpc("submit_event_registration", { payload: data });

  if (outcome === "code") {
    return { verify: data.email, error: "codeError", errors: { code: "invalid" } };
  }

  if (outcome === "locked") {
    return { verify: data.email, error: "codeLocked" };
  }

  return result(error);
}

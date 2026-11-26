"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { resources, submissions, validateResource } from "@egc/shared/resources.js";
import { createBracket, seedEntries, setWinner } from "@egc/shared/bracket.js";
import { casablancaDateTime } from "@egc/shared/dates.js";
import { requireStaff } from "@/lib/auth";

async function uploadImage(client, file) {
  if (!file || !file.size) {
    return null;
  }

  const types = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };

  if (!types[file.type] || file.size > 8 * 1024 * 1024) {
    throw new Error("Invalid image");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  if ((file.type === "image/jpeg" && !jpeg) ||
      (file.type === "image/png" && !png) ||
      (file.type === "image/webp" && !webp)) {
    throw new Error("Image content does not match its type");
  }

  const filename = `uploads/${crypto.randomUUID()}.${types[file.type]}`;
  const { error } = await client.storage.from("club-media").upload(filename, bytes, { contentType: file.type });

  if (error) {
    throw error;
  }

  return filename;
}

export async function saveContent(resource, id, _previous, form) {
  const { client } = await requireStaff();
  const config = resources[resource];

  if (!config || (config.noCreate && !id)) {
    return { error: "error" };
  }

  const data = {};
  let uploaded = null;

  try {
    for (const [name, type] of config.fields) {
      const value = String(form.get(name) ?? "").trim();

      if (type === "checkbox") {
        data[name] = form.get(name) === "on";
      } else if (type === "datetime-local") {
        data[name] = casablancaDateTime(value);
      } else if (type === "number" || name === "photo_offset_y") {
        data[name] = value === "" ? null : Number(value);
      } else {
        data[name] = value || (["game", "event_id"].includes(name) ? null : "");
      }
    }

    const errors = validateResource(resource, data);

    if (Object.keys(errors).length) {
      return { error: "error", errors };
    }

    if (config.image) {
      uploaded = await uploadImage(client, form.get("image"));

      if (uploaded) {
        data.image_path = uploaded;
      }

      if (resource === "gallery" && !id && !uploaded) {
        return { error: "error", errors: { image: "invalid" } };
      }
    }

    let mutation;
    let savedId = id;

    if (id) {
      mutation = client.from(config.table).update(data).eq("id", id).select("id").single();
    } else {
      savedId = crypto.randomUUID();
      mutation = client.from(config.table).insert({ ...data, id: savedId }).select("id").single();
    }

    const { error } = await mutation;

    if (error) {
      throw error;
    }

    revalidatePath(resource === "events" ? "/events" : `/manage/${resource}`, "layout");
    return { success: "saved", id: savedId };
  } catch {
    if (uploaded) {
      await client.storage.from("club-media").remove([uploaded]);
    }

    return { error: "error" };
  }
}

export async function updateSubmission(kind, id, _previous, form) {
  const { client } = await requireStaff();
  const config = submissions[kind];
  const status = String(form.get("status"));

  if (!config || !config.statuses.includes(status)) {
    return { error: "error" };
  }

  const { error } = await client.from(config.table).update({ status }).eq("id", id).select("id").single();

  if (error) {
    return { error: "error" };
  }

  revalidatePath(`/submissions/${kind}`);

  if (kind === "registrations") {
    revalidatePath("/events/[id]", "page");
  }
  return { success: "saved" };
}

const uuid = /^[0-9a-f-]{36}$/i;

// Bulk status change from an event's registration list.
export async function updateRegistrations(eventId, ids, status) {
  const { client } = await requireStaff();

  if (!uuid.test(eventId) || !submissions.registrations.statuses.includes(status) ||
    !Array.isArray(ids) || !ids.length || ids.length > 1024 || !ids.every((id) => uuid.test(id))) {
    return { error: "error" };
  }

  const { error } = await client.from("event_registrations")
    .update({ status }).eq("event_id", eventId).in("id", ids);

  if (error) {
    return { error: "error" };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: "saved" };
}

// Paid / present switches (check-in desk; present2 = second day).
export async function setRegistrationFlag(eventId, id, flag, value) {
  const { client } = await requireStaff();
  const changes = {
    paid: { paid: value === true },
    present: { checked_in_at: value === true ? new Date().toISOString() : null },
    present2: { checked_in_day2_at: value === true ? new Date().toISOString() : null },
  }[flag];

  if (!changes || !uuid.test(eventId) || !uuid.test(id)) {
    return { error: "error" };
  }

  const { error } = await client.from("event_registrations")
    .update(changes).eq("event_id", eventId).eq("id", id).select("id").single();

  if (error) {
    return { error: "error" };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: "saved" };
}

// Fisher–Yates with the platform CSPRNG.
// ponytail: modulo bias of 2^32 % n is negligible for ≤ 1024 entries.
function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }

  return copy;
}

// mode=draw: random draw (live "tirage"); otherwise rank-based seeding.
export async function generateBracket(eventId, _previous, form) {
  const { client } = await requireStaff();
  const [{ data: entries, error }, { count, error: countError }] = await Promise.all([
    client.from("event_registrations").select("id,players,seed").eq("event_id", eventId).eq("status", "approved").order("created_at"),
    client.from("event_matches").select("id", { count: "exact", head: true }).eq("event_id", eventId),
  ]);

  if (error || countError) {
    return { error: "error" };
  }

  if (entries.length < 2) {
    return { error: "notEnough" };
  }

  if (count && form.get("confirm") !== "on") {
    return { error: "confirmRegenerate" };
  }

  const ordered = form.get("mode") === "draw" ? shuffle(entries) : seedEntries(entries);
  const matches = createBracket(ordered.map((entry) => entry.id))
    .map((match) => ({ ...match, event_id: eventId }));
  const { error: deleteError } = await client.from("event_matches").delete().eq("event_id", eventId);
  const { error: insertError } = deleteError
    ? { error: deleteError }
    : await client.from("event_matches").insert(matches);

  if (insertError) {
    return { error: "error" };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: form.get("mode") === "draw" ? "drawn" : "generated" };
}

// Empty fields return an entry to automatic seeding; set ones must be unique within 1…entries.
export async function saveSeeds(eventId, _previous, form) {
  const { client } = await requireStaff();
  const { data: entries, error } = await client.from("event_registrations")
    .select("id,seed").eq("event_id", eventId).eq("status", "approved");

  if (error) {
    return { error: "error" };
  }

  const seeds = entries.map((entry) => {
    const value = String(form.get(`seed_${entry.id}`) || "").trim();
    return { ...entry, next: value ? Number(value) : null };
  });
  const used = seeds.map((entry) => entry.next).filter((seed) => seed !== null);

  if (used.some((seed) => !Number.isInteger(seed) || seed < 1 || seed > entries.length) || new Set(used).size !== used.length) {
    return { error: "invalidSeeds" };
  }

  for (const entry of seeds.filter((item) => item.next !== item.seed)) {
    const { error: updateError } = await client.from("event_registrations")
      .update({ seed: entry.next }).eq("id", entry.id).select("id").single();

    if (updateError) {
      return { error: "error" };
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: "saved" };
}

export async function saveMatchWinner(eventId, round, position, _previous, form) {
  const { client } = await requireStaff();
  const { data: matches, error } = await client.from("event_matches").select("*").eq("event_id", eventId);

  if (error) {
    return { error: "error" };
  }

  let updated;

  try {
    updated = setWinner(matches, round, position, String(form.get("winner") || ""), {
      score: String(form.get("score") || "").trim().slice(0, 20) || null,
      forfeit: form.get("forfeit") === "on",
    });
  } catch {
    return { error: "error" };
  }

  const changed = updated.filter((match, index) => ["team_a", "team_b", "winner", "score", "forfeit"]
    .some((key) => match[key] !== matches[index][key]));

  for (const match of changed) {
    const { error: updateError } = await client.from("event_matches")
      .update({ team_a: match.team_a, team_b: match.team_b, winner: match.winner, score: match.score, forfeit: match.forfeit })
      .eq("id", match.id).select("id").single();

    if (updateError) {
      return { error: "error" };
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: "saved" };
}

export async function inviteStaff(_previous, form) {
  const { client } = await requireStaff(true);
  const secret = process.env.SUPABASE_SECRET_KEY;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  const email = String(form.get("email") || "").trim().toLowerCase();
  const role = String(form.get("role"));

  if (!secret || !adminUrl) {
    return { error: "unavailable" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120 || !["admin", "manager"].includes(role)) {
    return { error: "error" };
  }

  const privileged = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await privileged.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${adminUrl}/reset-password`,
  });

  if (error || !data.user) {
    return { error: "error" };
  }

  const { error: profileError } = await client.from("staff_profiles").insert({
    user_id: data.user.id,
    email,
    role,
    active: true,
  });

  if (profileError) {
    await privileged.auth.admin.deleteUser(data.user.id);
    return { error: "error" };
  }

  revalidatePath("/staff");
  return { success: "invited" };
}

export async function updateStaff(userId, _previous, form) {
  const { client } = await requireStaff(true);
  const role = String(form.get("role"));

  if (!["admin", "manager"].includes(role)) {
    return { error: "error" };
  }

  const { error } = await client.from("staff_profiles")
    .update({ role, active: form.get("active") === "on" })
    .eq("user_id", userId).select("user_id").single();

  if (error) {
    return { error: "error" };
  }

  revalidatePath("/staff");
  return { success: "saved" };
}

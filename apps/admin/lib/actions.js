"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { resources, submissions, validateResource } from "@egc/shared/resources.js";
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

  if (!config) {
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

    if (id) {
      mutation = client.from(config.table).update(data).eq("id", id).select("id").single();
    } else {
      mutation = client.from(config.table).insert({ ...data, id: crypto.randomUUID() }).select("id").single();
    }

    const { error } = await mutation;

    if (error) {
      throw error;
    }
  } catch {
    if (uploaded) {
      await client.storage.from("club-media").remove([uploaded]);
    }

    return { error: "error" };
  }

  revalidatePath(`/manage/${resource}`);
  return { success: "saved" };
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

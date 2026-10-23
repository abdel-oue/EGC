"use server";

import { redirect } from "next/navigation";
import { getClient, requireStaff } from "@/lib/auth";

export async function signIn(_previous, form) {
  const client = await getClient();

  if (!client) {
    return { error: "unavailable" };
  }

  const { error } = await client.auth.signInWithPassword({
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  });

  if (error) {
    return { error: "loginError" };
  }

  await requireStaff();
  redirect("/");
}

export async function signOut() {
  const client = await getClient();

  if (client) {
    await client.auth.signOut();
  }

  redirect("/login");
}

export async function requestReset(_previous, form) {
  const client = await getClient();
  const site = process.env.NEXT_PUBLIC_ADMIN_URL;

  if (!client || !site) {
    return { error: "unavailable" };
  }

  await client.auth.resetPasswordForEmail(String(form.get("email") || "").trim(), {
    redirectTo: `${site}/auth/callback?next=/reset-password`,
  });

  return { success: "resetSent" };
}

export async function updatePassword(_previous, form) {
  const { client } = await requireStaff();
  const password = String(form.get("password") || "");

  if (password.length < 12 || password.length > 128) {
    return { error: "error" };
  }

  const { error } = await client.auth.updateUser({ password });

  if (error) {
    return { error: "error" };
  }

  return { success: "passwordUpdated" };
}

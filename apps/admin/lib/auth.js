import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionClient } from "@egc/shared/supabase.js";

export async function getClient() {
  return sessionClient(await cookies());
}

export const requireStaff = cache(async (adminOnly = false) => {
  const client = await getClient();

  if (!client) {
    redirect("/login?error=unavailable");
  }

  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await client.from("staff_profiles")
    .select("*").eq("user_id", user.id).eq("active", true).maybeSingle();

  if (!profile || (adminOnly && profile.role !== "admin")) {
    redirect("/login?error=loginError");
  }

  return { client, user, profile };
});

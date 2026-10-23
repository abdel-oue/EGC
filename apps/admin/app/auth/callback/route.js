import { NextResponse } from "next/server";
import { getClient } from "@/lib/auth";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const client = await getClient();

  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = url.searchParams.get("next") === "/reset-password" ? "/reset-password" : "/";
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=loginError", url.origin));
}

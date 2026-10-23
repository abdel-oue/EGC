import { NextResponse } from "next/server";
import { getClient } from "@/lib/auth";

export async function GET(request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const client = await getClient();

  if (client && tokenHash && ["invite", "recovery"].includes(type)) {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });

    if (!error) {
      return NextResponse.redirect(new URL("/reset-password", url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=loginError", url.origin));
}

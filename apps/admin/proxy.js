import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { configured } from "@egc/shared/supabase.js";

export async function proxy(request) {
  let response = NextResponse.next({ request });

  if (configured()) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(values) {
            for (const { name, value } of values) {
              request.cookies.set(name, value);
            }

            response = NextResponse.next({ request });

            for (const { name, value, options } of values) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    await client.auth.getUser();
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

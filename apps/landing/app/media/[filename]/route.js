import { readFile } from "node:fs/promises";
import path from "node:path";
import { configured } from "@egc/shared/supabase.js";
import initial from "@egc/shared/initial-content.json";

export async function GET(_request, { params }) {
  const { filename } = await params;
  const allowed = [...initial.members, ...initial.media].some((item) => item.image_path === filename);

  // Local preview originals must not bypass database visibility once Supabase is configured.
  if (configured() || !allowed) {
    return new Response(null, { status: 404 });
  }

  const image = await readFile(path.join(process.cwd(), "../../packages/shared/preview-media", filename));

  return new Response(image, {
    headers: {
      "Content-Type": filename.endsWith(".png") ? "image/png" : "image/jpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

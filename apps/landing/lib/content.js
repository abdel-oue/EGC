import "server-only";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { publicClient } from "@egc/shared/supabase.js";
import initialContent from "@egc/shared/initial-content.json";

export async function getContent(table) {
  // Short-lived public data streams after the static shell, while database reads remain cached.
  await connection();
  return readContent(table);
}

async function readContent(table) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 30, expire: 60 });
  const client = publicClient();

  if (!client) {
    const rows = table === "members" ? initialContent.members
      : table === "gallery_media" ? initialContent.media : [];

    return {
      rows: rows.map((row) => ({ ...row, image_url: `/media/${row.image_path}` })),
      unavailable: table === "events",
    };
  }

  let query = client.from(table).select("*");

  if (table === "events") {
    query = query.eq("status", "published").order("starts_at");
  } else {
    query = query.eq("visible", true).order("sort_order");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Public content unavailable:", table, error.code);
    return { rows: [], unavailable: true };
  }

  const rows = await Promise.all(data.map(async (row) => {
    if (!row.image_path) {
      return row;
    }

    const { data: signed } = await client.storage.from("club-media")
      .createSignedUrl(row.image_path, 3600);

    return { ...row, image_url: signed?.signedUrl ?? null };
  }));

  return { rows, unavailable: false };
}

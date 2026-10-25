import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { publicClient } from "@egc/shared/supabase.js";
import initialContent from "@egc/shared/initial-content.json";

export async function getContent(table) {
  // Request-rendered on Workers; reads are deduplicated per request.
  await connection();
  return readContent(table);
}

export async function getEventResults(eventId) {
  await connection();
  return readEventResults(eventId);
}

const readEventResults = cache(async (eventId) => {
  const client = publicClient();

  if (!client) {
    return { participants: [], matches: [] };
  }

  const [participants, matches] = await Promise.all([
    client.rpc("event_participants", { target_event: eventId }),
    client.from("event_matches").select("id,round,position,team_a,team_b,winner")
      .eq("event_id", eventId).order("round").order("position"),
  ]);

  if (participants.error || matches.error) {
    console.error("Event results unavailable:", participants.error?.code || matches.error?.code);
  }

  return { participants: participants.data || [], matches: matches.data || [] };
});

const readContent = cache(async (table) => {
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
});

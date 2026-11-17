import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registrationOpen } from "./validation.js";

test("the local archive preserves the five existing seeded club events with registration closed", async () => {
  const events = JSON.parse(await readFile(new URL("./past-events.json", import.meta.url), "utf8"));
  const seed = await readFile(new URL("../../scripts/seed.mjs", import.meta.url), "utf8");
  const slugs = new Set(events.map(event => event.slug));
  assert.equal(events.length, 5);
  assert.equal(slugs.size, 5);
  for (const event of events) {
    assert.ok(seed.includes(JSON.stringify(event.slug)), `Archive not found in the existing seed: ${event.slug}`);
    assert.ok(event.title_fr && event.title_en && event.description_fr && event.description_en);
    assert.ok(new Date(event.starts_at).getTime() < Date.parse("2026-11-17T00:00:00Z"));
    assert.equal(event.status, "published");
    assert.equal(registrationOpen(event), false);
    assert.equal(event.registration_enabled, false);
    assert.equal(event.id, undefined, "Preview archives must not invent database IDs");
  }
});

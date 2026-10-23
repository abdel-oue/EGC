import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? keys(child, path) : [path];
  });
}

test("public dictionaries have matching keys and preserve French accents", async () => {
  const french = JSON.parse(await readFile(new URL("./dictionaries/fr.json", import.meta.url), "utf8"));
  const english = JSON.parse(await readFile(new URL("./dictionaries/en.json", import.meta.url), "utf8"));
  assert.deepEqual(keys(french).sort(), keys(english).sort());
  assert.equal(french.content.upcoming, "Événements à venir");
  assert.doesNotMatch(JSON.stringify(french), /\p{L}\?\p{L}/u);
});

test("initial members and media reference available originals in the correct order", async () => {
  const initial = JSON.parse(await readFile(new URL("./initial-content.json", import.meta.url), "utf8"));
  assert.equal(initial.members.length, 10);
  assert.equal(new Set(initial.members.map((member) => member.id)).size, 10);
  assert.equal(initial.members[0].name, "OUEDGHIRI Abdelaziz");
  assert.equal(initial.members[9].name, "SQUALLI Omar");

  for (const record of [...initial.members, ...initial.media]) {
    const file = await readFile(new URL(`./preview-media/${record.image_path}`, import.meta.url));
    assert.ok(file.byteLength > 1000);
  }

  assert.equal(initial.media[0].kind, "promotion");
});

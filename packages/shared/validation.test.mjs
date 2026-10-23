import test from "node:test";
import assert from "node:assert/strict";
import { validateContact, validateEventRegistration, registrationOpen } from "./validation.js";
import { validateResource } from "./resources.js";
import { casablancaDateTime, dateTimeInput } from "./dates.js";

const now = Date.parse("2026-10-23T12:00:00Z");
const base = {
  id: "event",
  game: "valorant",
  status: "published",
  registration_enabled: true,
  starts_at: "2026-10-24T18:00:00Z",
  entry_type: "team",
  player_count: 2,
  substitute_count: 1,
};

function registration(event, includeSubstitute = false) {
  const form = new FormData();
  form.set("name", "Player Example");
  form.set("email", "PLAYER@EXAMPLE.COM");
  form.set("discord", "player.example");
  form.set("team_name", "EGC Duo");
  form.set("rules", "on");
  const count = event.entry_type === "individual" ? 1 : event.player_count;

  for (let index = 0; index < count + (includeSubstitute ? 1 : 0); index += 1) {
    form.set(`player_${index}_name`, `Player ${index}`);
    form.set(`player_${index}_handle`, `Player${index}#EGC`);
    form.set(`player_${index}_rank`, "gold");
  }

  return form;
}

test("contact validates input, normalizes email and bounds message size", () => {
  const form = new FormData();
  form.set("name", "Club Member");
  form.set("email", "  PLAYER@EXAMPLE.COM  ");
  form.set("subject", "Partenariat");
  form.set("message", "Une question pour le bureau.");
  assert.deepEqual(validateContact(form).errors, {});
  assert.equal(validateContact(form).data.email, "player@example.com");
  form.set("message", "a".repeat(5001));
  form.set("email", "invalid");
  assert.deepEqual(Object.keys(validateContact(form).errors).sort(), ["email", "message"]);
});

for (const count of [1, 2, 5]) {
  test(`validates ${count}-player entries and optional substitutes`, () => {
    const event = { ...base, entry_type: count === 1 ? "individual" : "team", player_count: count };

    for (const includeSubstitute of [false, true]) {
      const result = validateEventRegistration(registration(event, includeSubstitute), event, now);
      assert.deepEqual(result.errors, {});
      assert.equal(result.data.players.length, count + Number(includeSubstitute));
      assert.equal(result.data.email, "player@example.com");
      assert.equal(result.data.team_name, count === 1 ? null : "EGC Duo");
    }
  });
}

test("rejects incomplete substitutes, duplicate handles, invalid ranks and missing rules", () => {
  const form = registration(base);
  form.set("player_2_name", "Incomplete substitute");
  form.set("player_1_handle", "player0#egc");
  form.set("player_0_rank", "invented");
  form.delete("rules");
  const { errors } = validateEventRegistration(form, base, now);
  assert.equal(errors.player_1_handle, "duplicate");
  assert.equal(errors.player_0_rank, "invalid");
  assert.equal(errors.player_2_handle, "invalid");
  assert.equal(errors.rules, "invalid");
});

test("other games accept game handles without Valorant rank requirements", () => {
  const event = { ...base, game: "minecraft", entry_type: "individual", player_count: 1 };
  const form = registration(event);
  form.set("player_0_handle", "MinecraftPlayer");
  form.delete("player_0_rank");
  assert.deepEqual(validateEventRegistration(form, event, now).errors, {});
});

test("registration windows are enforced including exact closing boundary", () => {
  const closedEvents = [
    null,
    { ...base, status: "draft" },
    { ...base, registration_enabled: false },
    { ...base, starts_at: new Date(now).toISOString() },
    { ...base, registration_opens_at: new Date(now + 1).toISOString() },
    { ...base, registration_closes_at: new Date(now).toISOString() },
  ];

  for (const event of closedEvents) {
    assert.equal(registrationOpen(event, now), false);
    assert.equal(validateEventRegistration(new FormData(), event, now).errors.form, "closed");
  }

  assert.equal(registrationOpen({ ...base, registration_opens_at: new Date(now).toISOString() }, now), true);
});

test("Casablanca conversion honors winter offset and Ramadan time", () => {
  assert.equal(casablancaDateTime("2026-10-24T18:00"), "2026-10-24T17:00:00.000Z");
  assert.equal(casablancaDateTime("2026-03-01T18:00"), "2026-03-01T18:00:00.000Z");
  assert.equal(dateTimeInput("2026-10-24T17:00:00Z"), "2026-10-24T18:00");
  assert.throws(() => casablancaDateTime("invalid"));
  assert.throws(() => casablancaDateTime("2026-02-31T12:00"));
});

test("staff event validation rejects invalid formats and inconsistent registration settings", () => {
  const event = {
    slug: "valid-event", title_fr: "Tournoi", title_en: "", description_fr: "", description_en: "",
    game: "valorant", location: "ESISA", status: "draft", starts_at: "2026-10-24T17:00:00Z",
    entry_type: "team", player_count: 2, substitute_count: 0,
  };
  assert.deepEqual(validateResource("events", event), {});
  assert.equal(validateResource("events", { ...event, slug: "Bad slug" }).slug, "invalid");
  assert.equal(validateResource("events", { ...event, entry_type: "individual" }).player_count, "invalid");
  assert.equal(validateResource("events", { ...event, registration_closes_at: "2026-11-01T00:00:00Z" }).registration_closes_at, "invalid");
});

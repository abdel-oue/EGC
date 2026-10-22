// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRegistration } from "./registration.js";

const config = { players: 5, subs: 1, ranks: ["iron", "gold", "radiant"] };

function validForm() {
  const form = new FormData();
  form.set("teamName", "Fès Phantoms");
  form.set("teamTag", "fph");
  form.set("captainName", "Sara Benali");
  form.set("captainEmail", "Sara@Example.com");
  form.set("captainPhone", "+212 600 000 000");
  form.set("captainDiscord", "sara.gg");
  for (let i = 0; i < 5; i++) {
    form.set(`p${i}name`, `Player ${i}`);
    form.set(`p${i}riot`, `Player${i}#EUW${i}`);
    form.set(`p${i}rank`, "gold");
  }
  form.set("rules", "on");
  return form;
}

test("valid team passes and is normalized", () => {
  const { errors, data } = validateRegistration(validForm(), config);
  assert.deepEqual(errors, {});
  assert.equal(data.team_tag, "FPH");
  assert.equal(data.captain_email, "sara@example.com");
  assert.equal(data.players.length, 5);
});

test("empty sub slot is skipped, partial sub is rejected", () => {
  const form = validForm();
  form.set("p5name", "Sub Player");
  const { errors } = validateRegistration(form, config);
  assert.equal(errors.p5riot, "required");
  assert.equal(errors.p5rank, "required");
});

test("bad formats, duplicate Riot IDs and missing rules are reported", () => {
  const form = validForm();
  form.set("teamTag", "TOOLONG");
  form.set("captainEmail", "nope");
  form.set("p1riot", "NoTag");
  form.set("p2riot", "player0#euw0");
  form.set("p3rank", "bronze");
  form.delete("rules");
  form.delete("p4name");
  const { errors } = validateRegistration(form, config);
  assert.deepEqual(errors, {
    teamTag: "tag",
    captainEmail: "email",
    p1riot: "riotId",
    p2riot: "duplicateRiot",
    p3rank: "rank",
    p4name: "required",
    rules: "rules",
  });
});

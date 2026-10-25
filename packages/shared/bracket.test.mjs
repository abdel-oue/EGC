import test from "node:test";
import assert from "node:assert/strict";
import { createBracket, setWinner } from "./bracket.js";

const ordered = () => 0.999;

test("brackets give byes to the first entries and advance them", () => {
  const matches = createBracket(["a", "b", "c", "d", "e"], ordered);
  const first = matches.filter((match) => match.round === 1);

  assert.equal(matches.length, 7);
  assert.equal(first.length, 4);
  assert.ok(first.every((match) => match.team_a));
  assert.equal(first.filter((match) => match.winner).length, 3);
  assert.deepEqual(createBracket(["solo"]), []);
});

test("winners advance and corrections clear later results", () => {
  let matches = createBracket(["a", "b", "c", "d"], ordered);
  const [one, two] = matches.filter((match) => match.round === 1);

  matches = setWinner(matches, 1, 0, one.team_a);
  matches = setWinner(matches, 1, 1, two.team_b);
  matches = setWinner(matches, 2, 0, one.team_a);
  assert.equal(matches.find((match) => match.round === 2).winner, one.team_a);

  matches = setWinner(matches, 1, 0, one.team_b);
  const final = matches.find((match) => match.round === 2);
  assert.equal(final.team_a, one.team_b);
  assert.equal(final.winner, null);
  assert.throws(() => setWinner(matches, 1, 0, "z"));
});

import test from "node:test";
import assert from "node:assert/strict";
import { createBracket, isThirdPlace, roundName, seedEntries, setWinner } from "./bracket.js";

const seeds = (count) => Array.from({ length: count }, (_, index) => `s${index + 1}`);

test("brackets give byes to the top seeds and advance them", () => {
  const matches = createBracket(seeds(5));
  const first = matches.filter((match) => match.round === 1);

  assert.equal(matches.length, 8);
  assert.equal(matches.filter((match) => isThirdPlace(match, matches)).length, 1);
  assert.equal(first.length, 4);
  assert.ok(first.every((match) => match.team_a));
  assert.deepEqual(first.filter((match) => match.winner).map((match) => match.winner), ["s1", "s2", "s3"]);
  assert.deepEqual(createBracket(["solo"]), []);
});

test("eleven teams: three play-in matches feeding seeds 1, 2 and 3", () => {
  const matches = createBracket(seeds(11));
  const playIn = matches.filter((match) => match.round === 1 && match.team_b)
    .map((match) => [match.team_a, match.team_b]);
  const quarters = matches.filter((match) => match.round === 2)
    .map((match) => [match.team_a, match.team_b]);

  assert.deepEqual(playIn, [["s8", "s9"], ["s7", "s10"], ["s6", "s11"]]);
  assert.deepEqual(quarters, [["s1", null], ["s4", "s5"], ["s2", null], ["s3", null]]);
});

test("seeding uses average starter rank, best player, then order, and keeps staff seeds", () => {
  const team = (id, ranks, seed = null) => ({
    id,
    seed,
    players: ranks.map((rank) => ({ rank, sub: false })),
  });
  const entries = [
    team("low", ["iron", "bronze"]),
    team("tie-early", ["gold", "gold"]),
    team("tie-best", ["silver", "platinum"]),
    team("top", ["immortal", "diamond"]),
    team("tie-late", ["gold", "gold"]),
  ];

  assert.deepEqual(seedEntries(entries).map((entry) => entry.id), ["top", "tie-best", "tie-early", "tie-late", "low"]);

  entries[0].seed = 1;
  assert.deepEqual(seedEntries(entries).map((entry) => entry.id), ["low", "top", "tie-best", "tie-early", "tie-late"]);
});

test("winners advance and corrections clear later results", () => {
  let matches = createBracket(seeds(4));
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

test("semi-final losers meet for 3rd place; corrections move them and clear scores", () => {
  let matches = createBracket(seeds(8));
  const third = () => matches.find((match) => isThirdPlace(match, matches));
  const semis = () => matches.filter((match) => match.round === 2);

  for (const match of matches.filter((item) => item.round === 1)) {
    matches = setWinner(matches, 1, match.position, match.team_a);
  }

  const [one, two] = semis();
  matches = setWinner(matches, 2, 0, one.team_a, { score: "2-1" });
  matches = setWinner(matches, 2, 1, two.team_b, { forfeit: true });
  assert.deepEqual([third().team_a, third().team_b], [one.team_b, two.team_a]);
  assert.equal(semis()[1].forfeit, true);

  matches = setWinner(matches, 3, 1, one.team_b, { score: "TAB 4-3" });
  matches = setWinner(matches, 3, 0, one.team_a, { score: "1-0" });
  assert.equal(third().winner, one.team_b);

  // A new semi-final result swaps the loser and voids the 3rd-place result.
  matches = setWinner(matches, 2, 0, one.team_b);
  assert.equal(third().team_a, one.team_a);
  assert.equal(third().winner, null);
  assert.equal(third().score, null);
  assert.equal(matches.find((match) => match.round === 3 && match.position === 0).winner, null);
  assert.equal(createBracket(seeds(3)).some((match) => isThirdPlace(match, createBracket(seeds(3)))), false);
});

test("round names follow the number of slots", () => {
  const labels = { final: "Finale", semifinals: "Demies", quarterfinals: "Quarts", roundOf: "{n}es de finale" };
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((round) => roundName(round, 6, labels)),
    ["32es de finale", "16es de finale", "8es de finale", "Quarts", "Demies", "Finale"]);
  assert.equal(roundName(1, 6, { roundOf: "Round of {size}" }), "Round of 64");
});

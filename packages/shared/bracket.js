import { ranks } from "./validation.js";

// Starting players' rank tiers, Iron = 1 … Radiant = 9. Unknown ranks are ignored.
export function teamRating(players = []) {
  const tiers = players
    .filter((player) => !player.sub && ranks.includes(player.rank))
    .map((player) => ranks.indexOf(player.rank) + 1);

  return {
    average: tiers.length ? tiers.reduce((sum, tier) => sum + tier, 0) / tiers.length : 0,
    best: Math.max(0, ...tiers),
  };
}

// Strongest first: average rank, then best player, then registration order.
// Staff-assigned seeds keep their slot; everyone else fills the gaps in rating order.
export function seedEntries(entries) {
  const slots = new Array(entries.length).fill(null);
  const rest = [];

  entries.forEach((entry, index) => {
    const rated = { ...entry, index, rating: teamRating(entry.players) };

    if (entry.seed >= 1 && entry.seed <= entries.length && !slots[entry.seed - 1]) {
      slots[entry.seed - 1] = rated;
    } else {
      rest.push(rated);
    }
  });

  rest.sort((a, b) => b.rating.average - a.rating.average || b.rating.best - a.rating.best || a.index - b.index);
  return slots.map((slot) => slot || rest.shift());
}

// Seed order of a standard draw: [1, 16, 8, 9, 4, 13, …] for 16 slots, so seed 1 meets the last seed.
function drawOrder(size) {
  let order = [1];

  while (order.length < size) {
    const next = order.length * 2 + 1;
    order = order.flatMap((seed) => [seed, next - seed]);
  }

  return order;
}

// Single elimination from entries listed strongest first: the top seeds get the byes,
// every round is created up front and byes advance automatically.
export function createBracket(entryIds) {
  if (entryIds.length < 2) {
    return [];
  }

  const rounds = Math.ceil(Math.log2(entryIds.length));
  const order = drawOrder(2 ** rounds);
  const matches = [];

  for (let round = 1; round <= rounds; round += 1) {
    for (let position = 0; position < 2 ** (rounds - round); position += 1) {
      matches.push({ round, position, team_a: null, team_b: null, winner: null });
    }
  }

  // The better seed is always team_a and always exists, so byes only leave team_b empty.
  const first = matches.filter((match) => match.round === 1);

  first.forEach((match, index) => {
    match.team_a = entryIds[order[index * 2] - 1];
    match.team_b = entryIds[order[index * 2 + 1] - 1] ?? null;
  });

  for (const match of first) {
    if (!match.team_b) {
      advance(matches, match, match.team_a);
    }
  }

  return matches;
}

// Returns a copy with the winner recorded and carried into the next round.
export function setWinner(matches, round, position, winner) {
  const copy = matches.map((match) => ({ ...match }));
  const match = find(copy, round, position);

  if (!match || !winner || (winner !== match.team_a && winner !== match.team_b)) {
    throw new Error("The winner must play in this match");
  }

  advance(copy, match, winner);
  return copy;
}

function find(matches, round, position) {
  return matches.find((match) => match.round === round && match.position === position);
}

function advance(matches, match, winner) {
  match.winner = winner;
  const following = find(matches, match.round + 1, Math.floor(match.position / 2));
  const slot = match.position % 2 === 0 ? "team_a" : "team_b";

  if (following && following[slot] !== winner) {
    following[slot] = winner;
    reset(matches, following);
  }
}

// A changed entrant invalidates that match's result and everything it fed.
function reset(matches, match) {
  if (!match.winner) {
    return;
  }

  const previous = match.winner;
  match.winner = null;
  const following = find(matches, match.round + 1, Math.floor(match.position / 2));
  const slot = match.position % 2 === 0 ? "team_a" : "team_b";

  if (following && following[slot] === previous) {
    following[slot] = null;
    reset(matches, following);
  }
}

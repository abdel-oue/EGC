// Single elimination: every round is created up front, byes advance automatically.
export function createBracket(entryIds, random = Math.random) {
  const entries = [...entryIds];

  for (let index = entries.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [entries[index], entries[swap]] = [entries[swap], entries[index]];
  }

  if (entries.length < 2) {
    return [];
  }

  const rounds = Math.ceil(Math.log2(entries.length));
  const matches = [];

  for (let round = 1; round <= rounds; round += 1) {
    for (let position = 0; position < 2 ** (rounds - round); position += 1) {
      matches.push({ round, position, team_a: null, team_b: null, winner: null });
    }
  }

  // Every first-round match gets a team_a, so byes never leave a match empty.
  const first = matches.filter((match) => match.round === 1);

  entries.forEach((entry, index) => {
    first[index % first.length][index < first.length ? "team_a" : "team_b"] = entry;
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

function roundName(round, total, playIn, labels) {
  const fromEnd = total - round;

  if (fromEnd === 0) {
    return labels.final;
  }

  if (fromEnd === 1) {
    return labels.semifinals;
  }

  if (fromEnd === 2) {
    return labels.quarterfinals;
  }

  return round === 1 && playIn ? labels.playIn : `${labels.round} ${round}`;
}

// Columns per round. Round-one byes keep an invisible slot so later matches stay level with their feeders.
export default function Bracket({ matches, names, seeds, labels }) {
  const rounds = [...new Set(matches.map((match) => match.round))];
  const playIn = matches.some((match) => match.round === 1 && !match.team_b);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-8">
        {rounds.map((round) => (
          <section key={round} className="flex w-60 flex-col">
            <h3 className={`mb-4 font-display font-bold uppercase ${round === 1 && playIn ? "text-accent" : ""}`}>
              {roundName(round, rounds.length, playIn, labels)}
            </h3>
            <ol className="flex flex-1 flex-col justify-around gap-4">
              {matches.filter((match) => match.round === round).map((match) => {
                const bye = round === 1 && !match.team_b;

                return (
                  <li
                    key={match.id}
                    aria-hidden={bye || undefined}
                    className={`border border-l-4 border-line bg-offwhite ${bye ? "invisible" : ""} ${round === 1 ? "border-l-accent" : "border-l-night"}`}
                  >
                    {["team_a", "team_b"].map((slot) => {
                      const team = match[slot];
                      const won = team && match.winner === team;
                      const lost = team && match.winner && !won;

                      return (
                        <p key={slot} className={`flex gap-3 px-3 py-2 ${won ? "font-bold text-accent" : ""} ${lost ? "text-night/50 line-through" : ""}`}>
                          <span className="w-5 shrink-0 text-right text-sm tabular-nums text-night/60">{team ? seeds.get(team) : ""}</span>
                          <span className="truncate">{team ? names.get(team) || labels.tbd : labels.tbd}</span>
                        </p>
                      );
                    })}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

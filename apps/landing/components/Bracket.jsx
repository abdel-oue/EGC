export default function Bracket({ matches, names, labels }) {
  const rounds = [...new Set(matches.map((match) => match.round))];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-6">
        {rounds.map((round) => (
          <section key={round} className="w-60">
            <h3 className="mb-4 font-display font-bold uppercase text-accent">
              {round === rounds.length ? labels.final : `${labels.round} ${round}`}
            </h3>
            <ol className="flex h-full flex-col justify-around gap-4">
              {matches.filter((match) => match.round === round).map((match) => (
                <li key={match.id} className="border border-line bg-offwhite">
                  {["team_a", "team_b"].map((slot) => {
                    const team = match[slot];
                    const won = team && match.winner === team;
                    const lost = team && match.winner && !won;
                    const empty = round === 1 && !team ? labels.bye : labels.tbd;

                    return (
                      <p key={slot} className={`border-l-4 px-3 py-2 ${won ? "border-accent font-bold" : "border-transparent"} ${lost ? "text-night/50 line-through" : ""}`}>
                        {team ? names.get(team) || labels.tbd : empty}
                      </p>
                    );
                  })}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

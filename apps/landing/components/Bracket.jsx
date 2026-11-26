import { isThirdPlace, roundName as slotName } from "@egc/shared/bracket.js";

function roundName(round, total, playIn, labels) {
  return round === 1 && playIn ? labels.playIn : slotName(round, total, labels);
}

function Match({ match, names, seeds, labels, tone }) {
  return (
    <div className={`my-3 w-56 border border-l-4 ${tone}`}>
      {["team_a", "team_b"].map((slot, index) => {
        const team = match[slot];
        const won = team && match.winner === team;
        const lost = team && match.winner && !won;

        return (
          <p
            key={slot}
            className={`flex items-center gap-3 px-3 py-2.5 ${index ? "border-t border-offwhite/10" : ""} ${won ? "font-bold text-offwhite" : ""} ${lost ? "text-offwhite/35" : ""} ${!team ? "text-offwhite/40" : ""}`}
          >
            <span className={`grid size-6 shrink-0 place-items-center text-xs tabular-nums ${won ? "bg-accent text-offwhite" : "bg-night/70 text-offwhite/60"}`}>
              {team ? seeds.get(team) : "–"}
            </span>
            <span className="truncate">{team ? names.get(team) || labels.tbd : labels.tbd}</span>
            {won && match.score && <span className="ml-auto shrink-0 text-xs tabular-nums text-accent">{match.score}</span>}
            {lost && match.forfeit && <span className="ml-auto shrink-0 text-xs uppercase">{labels.forfeit}</span>}
          </p>
        );
      })}
    </div>
  );
}

// Lines from a pair of matches (or a single play-in) to the match they feed.
function Connector({ count }) {
  return (
    <div className="relative flex-1">
      {count === 2 && (
        <>
          <span className="absolute inset-y-1/4 left-0 w-1/2 border-y border-r border-offwhite/25" />
          <span className="absolute top-1/2 right-0 w-1/2 border-t border-offwhite/25" />
        </>
      )}
      {count === 1 && <span className="absolute inset-x-0 top-1/2 border-t border-offwhite/25" />}
    </div>
  );
}

// Each column lists its matches grouped by the match they feed, so every group lines up with its target.
// Round-one byes are left out; their group simply holds fewer matches.
export default function Bracket({ matches, names, seeds, labels }) {
  const total = Math.max(...matches.map((match) => match.round));
  const third = matches.find((match) => isThirdPlace(match, matches));
  const playIn = matches.some((match) => match.round === 1 && !match.team_b);
  const columns = Array.from({ length: total }, (_, index) => {
    const round = index + 1;
    const groups = Array.from({ length: round === total ? 1 : 2 ** (total - round - 1) }, () => []);

    for (const match of matches.filter((item) => item.round === round)) {
      if (!(round === 1 && !match.team_b) && match !== third) {
        groups[round === total ? 0 : Math.floor(match.position / 2)].push(match);
      }
    }

    return { round, groups, count: groups.flat().length };
  });

  return (
    <div className="overflow-x-auto border border-offwhite/15 bg-surface-dark p-6 text-offwhite sm:p-8">
      <div className="flex min-w-max">
        {columns.map(({ round, groups, count }) => (
          <div key={round} className="contents">
            <section className="flex flex-col">
              <h3 className={`mb-6 font-display text-sm font-bold uppercase tracking-widest ${round === 1 && playIn ? "text-accent" : "text-offwhite/70"}`}>
                {roundName(round, total, playIn, labels)} <span className="text-offwhite/40">({count})</span>
              </h3>
              <div className="flex flex-1 flex-col">
                {groups.map((group, index) => (
                  <div key={index} className="flex flex-1 flex-col justify-around py-1">
                    {group.map((match) => (
                      <Match
                        key={match.id}
                        match={match}
                        names={names}
                        seeds={seeds}
                        labels={labels}
                        tone={round === total ? "border-accent bg-accent/15" : `border-offwhite/10 bg-graphite ${round === 1 && playIn ? "border-l-accent" : "border-l-offwhite/30"}`}
                      />
                    ))}
                  </div>
                ))}
                {round === total && third && (
                  <div className="mt-6">
                    <h3 className="font-display text-xs font-bold uppercase tracking-widest text-offwhite/70">{labels.thirdPlace}</h3>
                    <Match match={third} names={names} seeds={seeds} labels={labels} tone="border-offwhite/10 bg-graphite border-l-offwhite/30" />
                  </div>
                )}
              </div>
            </section>
            {round < total && (
              <div className="flex w-10 flex-col">
                <div className="mb-6 h-5" />
                <div className="flex flex-1 flex-col">
                  {groups.map((group, index) => <Connector key={index} count={group.length} />)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

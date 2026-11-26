import { isThirdPlace, roundName } from "@egc/shared/bracket.js";

function Slot({ team, match, names, seeds, labels }) {
  const won = team && match.winner === team;
  const lost = team && match.winner && !won;

  return (
    <p className={`flex items-center gap-1.5 px-1.5 py-1 ${won ? "font-bold text-offwhite" : ""} ${lost ? "text-offwhite/35" : ""} ${!team ? "text-offwhite/40" : ""}`}>
      <span className={`grid size-4 shrink-0 place-items-center text-[10px] tabular-nums ${won ? "bg-accent text-offwhite" : "bg-night/70 text-offwhite/60"}`}>
        {team ? seeds.get(team) : "–"}
      </span>
      <span className="truncate">{team ? names.get(team) || labels.tbd : labels.tbd}</span>
      {won && match.score && <span className="ml-auto shrink-0 tabular-nums text-accent">{match.score}</span>}
      {lost && match.forfeit && <span className="ml-auto shrink-0 uppercase">{labels.forfeit}</span>}
    </p>
  );
}

function Match({ match, tone, ...props }) {
  // Round-one byes keep their space so both halves stay aligned.
  if (match.round === 1 && !match.team_b) {
    return <div aria-hidden="true" className="invisible my-0.5 h-12" />;
  }

  return (
    <div className={`my-0.5 border border-l-4 text-xs ${tone}`}>
      <Slot team={match.team_a} match={match} {...props} />
      <p className="border-t border-offwhite/10" />
      <Slot team={match.team_b} match={match} {...props} />
    </div>
  );
}

function Column({ title, matches, tone, ...props }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h3 className="mb-2 truncate text-center font-display text-[11px] font-bold uppercase tracking-widest text-offwhite/70">{title}</h3>
      <div className="flex flex-1 flex-col justify-around">
        {matches.map((match) => <Match key={match.id} match={match} tone={tone} {...props} />)}
      </div>
    </section>
  );
}

// Two-sided bracket: the top half of the draw comes from the left, the bottom half from the right,
// and they meet at the final in the centre (with the match for 3rd place below it).
// `from` hides the rounds before it (e.g. start at the 16es on the second day).
export default function BracketBoard({ matches, names, seeds, labels, from = 1 }) {
  const total = Math.max(...matches.map((match) => match.round));
  const third = matches.find((match) => isThirdPlace(match, matches));
  const final = matches.find((match) => match.round === total && match.position === 0);
  const playIn = matches.some((match) => match.round === 1 && !match.team_b);
  const props = { names, seeds, labels };
  const side = (round, left) => matches
    .filter((match) => match.round === round && match !== third &&
      (match.position < 2 ** (total - round - 1)) === left)
    .sort((a, b) => a.position - b.position);
  const title = (round) => round === 1 && playIn ? labels.playIn : roundName(round, total, labels);
  const first = Math.min(Math.max(1, from), total);
  const rounds = Array.from({ length: total - first }, (_, index) => index + first);
  const tone = "border-offwhite/10 border-l-offwhite/30 bg-graphite";

  return (
    <div className={`flex flex-1 gap-2 ${rounds.length > 3 ? "min-w-[1100px]" : ""}`}>
      {rounds.map((round) => <Column key={`l${round}`} title={title(round)} matches={side(round, true)} tone={tone} {...props} />)}
      <section className="flex w-56 shrink-0 flex-col justify-center gap-8 px-2">
        <div>
          <h3 className="mb-2 text-center font-display text-sm font-bold uppercase tracking-widest text-accent">{labels.final}</h3>
          {final && <Match match={final} tone="border-accent bg-accent/15" {...props} />}
        </div>
        {third && (
          <div>
            <h3 className="mb-2 text-center font-display text-[11px] font-bold uppercase tracking-widest text-offwhite/70">{labels.thirdPlace}</h3>
            <Match match={third} tone={tone} {...props} />
          </div>
        )}
      </section>
      {rounds.toReversed().map((round) => <Column key={`r${round}`} title={title(round)} matches={side(round, false)} tone={tone} {...props} />)}
    </div>
  );
}

import { ranks } from "@egc/shared/validation.js";

function Group({ title, intro, entries, offset, labels, rankNames, accent }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className={`font-display text-2xl font-bold uppercase ${accent ? "text-accent" : ""}`}>{title}</h3>
        {intro && <p className="text-night/70">{intro}</p>}
      </div>
      <ol className="space-y-3">
        {entries.map((entry, index) => {
          const average = entry.rating.average;

          return (
            <li key={entry.id} className={`flex gap-4 border border-l-4 border-line bg-offwhite p-4 ${accent ? "border-l-accent" : "border-l-night"}`}>
              <p className="font-display text-3xl font-bold tabular-nums">
                <span className="sr-only">{labels.seed} </span>
                {offset + index + 1}
              </p>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold">{entry.team_name || entry.players[0]?.handle}</p>
                <p className="text-sm">
                  {labels.averageRank}{" · "}
                  <span className="font-bold">
                    {average ? `${rankNames[ranks[Math.round(average) - 1]]} (${average.toFixed(1)})` : labels.unranked}
                  </span>
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-4 text-sm text-night/70">
                  {entry.players.map((player) => (
                    <li key={player.handle}>
                      {player.handle}
                      {player.rank && ` · ${rankNames[player.rank] || player.rank}`}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// Seeded entries, strongest first. The top seeds that skip round one are listed apart from the play-in.
export default function Standings({ entries, labels, rankNames }) {
  const size = entries.length > 1 ? 2 ** Math.ceil(Math.log2(entries.length)) : entries.length;
  const byes = size - entries.length;
  const shared = { labels, rankNames };

  return (
    <div className="space-y-10">
      <p className="border border-line bg-panel p-4 text-sm">{labels.standingsNote}</p>
      {byes > 0 ? (
        <div className="grid gap-10 lg:grid-cols-2">
          <Group title={labels.byeTitle} intro={labels.byeIntro} entries={entries.slice(0, byes)} offset={0} {...shared} />
          <Group title={labels.playInTitle} intro={labels.playInIntro} entries={entries.slice(byes)} offset={byes} accent {...shared} />
        </div>
      ) : (
        <Group title={labels.tabStandings} entries={entries} offset={0} {...shared} />
      )}
    </div>
  );
}

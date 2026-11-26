import t from "@egc/shared/admin.json";
import { seedEntries } from "@egc/shared/bracket.js";
import { generateBracket, saveMatchWinner, saveSeeds } from "@/lib/actions";
import ActionForm from "@/components/ActionForm";

export function entryName(entry) {
  return entry?.team_name || entry?.players?.[0]?.handle || entry?.name || t.tbd;
}

// Seeds (rank-based generation) and match results for an event's approved entries.
export default function BracketPanel({ eventId, entries, matches }) {
  const seeded = seedEntries(entries);
  const names = new Map(seeded.map((entry, index) => [entry.id, `${index + 1}. ${entryName(entry)}`]));
  const rounds = [...new Set(matches.map((match) => match.round))];

  return (
    <>
      <p className="mb-8 max-w-3xl">{t.bracketNote}</p>
      <details className="mb-10 max-w-3xl border border-line bg-panel p-5 sm:p-6">
        <summary className="font-bold">{t.approvedEntries} ({entries.length}) · {t.seeds}</summary>
        <div className="mt-6 space-y-8">
          <ActionForm action={saveSeeds.bind(null, eventId)} submitLabel={t.saveSeeds}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">{t.approvedEntries}</th>
                    <th className="py-2">{t.averageRank}</th>
                    <th className="py-2">{t.seeds}</th>
                  </tr>
                </thead>
                <tbody>
                  {seeded.map((entry, index) => (
                    <tr key={entry.id} className="border-t border-line">
                      <td className="py-2 font-bold">{index + 1}</td>
                      <td className="py-2">{entryName(entry)}</td>
                      <td className="py-2">{entry.rating.average ? `${entry.rating.average.toFixed(1)} / 9` : "—"}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          name={`seed_${entry.id}`}
                          min="1"
                          max={seeded.length}
                          defaultValue={entry.seed ?? ""}
                          placeholder={t.seedHint}
                          aria-label={`${t.seeds} — ${entryName(entry)}`}
                          className="w-36 border border-line bg-offwhite px-3 py-2"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ActionForm>
          <ActionForm action={generateBracket.bind(null, eventId)} submitLabel={matches.length ? t.regenerate : t.generate}>
            {matches.length > 0 && (
              <label className="flex items-center gap-3">
                <input type="checkbox" name="confirm" className="size-5" />
                <span>{t.confirmRegenerate}</span>
              </label>
            )}
          </ActionForm>
        </div>
      </details>
      <div className="grid gap-8 xl:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {rounds.map((round) => (
          <section key={round}>
            <h2 className="mb-4 font-display text-xl font-bold uppercase">
              {round === rounds.length ? t.final : `${t.round} ${round}`}
            </h2>
            <ol className="space-y-4">
              {matches.filter((match) => match.round === round).map((match) => (
                <li key={match.id} className="border border-line bg-panel p-4">
                  {match.team_a && match.team_b ? (
                    <ActionForm action={saveMatchWinner.bind(null, eventId, match.round, match.position)} submitLabel={t.setWinner}>
                      <fieldset className="space-y-2">
                        <legend className="mb-2 font-bold">{t.winner}</legend>
                        {[match.team_a, match.team_b].map((team) => (
                          <label key={team} className="flex items-center gap-3 py-1">
                            <input type="radio" name="winner" value={team} defaultChecked={match.winner === team} required className="size-6" />
                            <span className={match.winner === team ? "font-bold text-accent" : ""}>{names.get(team) || t.tbd}</span>
                          </label>
                        ))}
                      </fieldset>
                    </ActionForm>
                  ) : (
                    <p>
                      {names.get(match.team_a) || t.tbd} — {match.round === 1 ? t.bye : names.get(match.team_b) || t.tbd}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

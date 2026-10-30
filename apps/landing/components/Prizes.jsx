// One line per final place: the first is the winner's prize, the second the runner-up's.
export default function Prizes({ text, labels }) {
  const prizes = text.split("\n").map((line) => line.trim()).filter(Boolean);

  if (!prizes.length) {
    return null;
  }

  return (
    <section aria-labelledby="prizes">
      <h3 id="prizes" className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-night/60">{labels.prizesTitle}</h3>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {prizes.map((prize, index) => (
          <li
            key={index}
            className={`border border-l-4 p-5 ${index ? "border-line border-l-night bg-panel" : "border-accent bg-night text-offwhite"}`}
          >
            <p className={`font-display text-sm font-bold uppercase tracking-widest ${index ? "text-night/60" : "text-accent"}`}>
              {labels.places[index] || `#${index + 1}`}
            </p>
            <p className="font-display text-3xl font-bold">{prize}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

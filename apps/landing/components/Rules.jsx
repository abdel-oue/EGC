// "# Title" lines start a section; every other line is one rule.
export function ruleSections(text) {
  const sections = [];

  for (const line of text.split("\n").map((rule) => rule.trim()).filter(Boolean)) {
    if (line.startsWith("#")) {
      sections.push({ title: line.replace(/^#+\s*/, ""), rules: [] });
    } else {
      if (!sections.length) {
        sections.push({ title: "", rules: [] });
      }

      sections.at(-1).rules.push(line);
    }
  }

  return sections;
}

export default function Rules({ sections }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section, index) => (
        <section key={index} className="border border-line bg-panel p-6">
          {section.title && (
            <h3 className="mb-4 font-display text-xl font-bold uppercase">
              <span className="mr-2 text-accent">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </h3>
          )}
          <ol className="list-inside list-decimal space-y-2">
            {section.rules.map((rule, ruleIndex) => <li key={ruleIndex}>{rule}</li>)}
          </ol>
        </section>
      ))}
    </div>
  );
}

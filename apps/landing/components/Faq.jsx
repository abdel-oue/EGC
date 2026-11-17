import { editorial } from "./editorial-copy";
export default function Faq({ dict, locale = "fr", compact = false }) {
  const t = editorial(locale);
  const items = compact
    ? [dict.faq.items[0], dict.faq.items[2]]
    : dict.faq.items;
  return (
    <section id="faq" className="questions site-width">
      <h2 className="display">
        {t.questionLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <div className="question-list">
        {items.map((item, index) => (
          <details className="question" key={item.q} open={index === 0}>
            <summary>
              {item.q}
              <svg
                className="state-icon question-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M4 12h16" />
                <path className="question-plus" d="M12 4v16" />
              </svg>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

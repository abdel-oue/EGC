export default function PageHeader({ ghost, title, intro, children }) {
  return (
    <header className="generic-page-header site-width">
      <p className="eyebrow">{ghost}</p>
      <h1 className="display">{title}</h1>
      <span className="accent-rule" />
      {intro && <p className="generic-intro">{intro}</p>}
      {children}
    </header>
  );
}

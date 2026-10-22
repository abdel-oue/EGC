// Top of every inner page: outlined ghost word, big title, orange sweep line, intro.
export default function PageHeader({ ghost, title, intro, children }) {
  return (
    <header className="bg-grid relative overflow-clip px-4 pb-12 pt-16 sm:px-8 lg:px-12 lg:pt-32">
      <div className="mx-auto max-w-6xl">
        <p aria-hidden="true" className="intro intro-1 text-ghost select-none font-display text-6xl font-bold uppercase leading-none sm:text-8xl">
          {ghost}
        </p>
        <h1 className="intro intro-2 -mt-5 font-display text-4xl font-bold uppercase sm:-mt-10 sm:text-6xl">{title}</h1>
        <span className="animate-sweep mt-4 block h-1 w-24 bg-accent" />
        {intro && <p className="intro intro-3 mt-6 max-w-2xl text-lg text-night/60">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

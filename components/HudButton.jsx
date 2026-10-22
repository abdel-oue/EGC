// Chamfered call-to-action link. variant: "accent" | "night" | "outline".
const variants = {
  accent: "bg-accent text-offwhite hover:bg-night",
  night: "bg-night text-offwhite hover:bg-accent",
  outline: "bg-night/5 text-night hover:bg-night hover:text-offwhite",
};

export default function HudButton({ href, variant = "accent", className = "", children }) {
  return (
    <a
      href={href}
      className={`chamfer shine group inline-flex items-center gap-3 px-7 py-4 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${variants[variant]} ${className}`}
    >
      {children}
      <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </a>
  );
}

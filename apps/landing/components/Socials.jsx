import { socials } from "@/lib/site";

const tile = "chamfer-sm grid size-11 place-items-center transition-all duration-300 hover:-translate-y-1";

const icons = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  discord: (
    <>
      <path d="M8.5 17.5c-2 .4-4-.1-5.5-1.2.3-3.6 1.3-7 3-10.1a13 13 0 0 1 4-1.2l.6 1.3a13 13 0 0 1 2.8 0l.6-1.3a13 13 0 0 1 4 1.2c1.7 3 2.7 6.5 3 10.1-1.5 1.1-3.5 1.6-5.5 1.2l-1-1.9" />
      <path d="M7.5 15.5c3 1.4 6 1.4 9 0" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  twitch: <path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7M16 11V7" />,
};

const labels = { instagram: "Instagram", discord: "Discord", twitch: "Twitch" };

export default function Socials({ className = "", tileClass = "bg-graphite text-offwhite hover:bg-accent" }) {
  return (
    <ul className={`flex gap-2 ${className}`}>
      {Object.keys(icons).map((key) => (
        <li key={key}>
          <a href={socials[key]} aria-label={labels[key]} target="_blank" rel="noopener noreferrer" className={`${tile} ${tileClass}`}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icons[key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

import Image from "next/image";
import { socials } from "@/lib/site";
import { Arrow } from "./Editorial";
import { editorial } from "./editorial-copy";
export default function EventEmpty({
  locale,
  labels,
  past = false,
  unavailable = false,
}) {
  const t = editorial(locale);
  const lines = unavailable
    ? t.unavailableLines
    : past
      ? t.emptyPastLines
      : t.emptyLines;
  return (
    <div className="event-empty feature-panel">
      <div className="feature-copy">
        <p className="eyebrow accent">
          {past ? t.emptyPastEyebrow : t.emptyEyebrow}
        </p>
        <h2 className="display">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <div className="feature-description">
          {unavailable ? (
            <p role="status">{labels.unavailable}</p>
          ) : (
            <p>{past ? t.emptyPastText : t.emptyText}</p>
          )}
          <p>{t.followText}</p>
        </div>
        <a
          className="pill"
          href={socials.discord}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.joinDiscord}
          <Arrow />
        </a>
        <a
          className="text-link event-instagram"
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.visitInstagram}
          <Arrow />
        </a>
      </div>
      <div className="feature-art trophy-art" aria-hidden="true">
        <Image
          src="/design/trophy.webp"
          alt=""
          fill
          sizes="(max-width: 700px) 90vw, 48vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}

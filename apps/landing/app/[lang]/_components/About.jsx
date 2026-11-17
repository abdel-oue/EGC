import Image from "next/image";
import { editorial } from "@/components/editorial-copy";
export default function About({ locale = "fr" }) {
  const t = editorial(locale);
  return (
    <section id="about" className="about-section site-width">
      <div>
        <p className="eyebrow">{t.aboutEyebrow}</p>
        <h2 className="display" aria-label={t.aboutLines.join(" ")}>
          {t.aboutLines.map((line, index) => (
            <span key={line} className={index ? "accent" : undefined}>
              {line}
            </span>
          ))}
        </h2>
      </div>
      <div className="about-copy">
        <span className="accent-rule" />
        {t.aboutParagraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={index === t.aboutParagraphs.length - 1 ? "about-closing" : undefined}
          >
            {paragraph}
          </p>
        ))}
        <p className="about-signature">
          EGC — <em>where passion is born.</em>
        </p>
        <Image
          src="/brand/logo-full-night.svg"
          alt="ESISA Gaming Club"
          width={180}
          height={75}
          className="about-logo"
        />
      </div>
    </section>
  );
}

import Image from "next/image";
import { editorial } from "@/components/editorial-copy";
export default function About({ dict, locale = "fr" }) {
  const a = dict.about;
  const t = editorial(locale);
  return (
    <section id="about" className="about-section site-width">
      <div>
        <p className="eyebrow">{t.aboutEyebrow}</p>
        <h2 className="display">
          {t.aboutLines[0]}
          <br />
          <span className="accent">{t.aboutLines[1]}</span>
        </h2>
      </div>
      <div className="about-copy">
        <span className="accent-rule" />
        <h3>{a.lead}</h3>
        <p>{a.p1}</p>
        <h3>{a.h2}</h3>
        <p>{a.p2}</p>
        <p className="about-closing">{a.closing}</p>
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

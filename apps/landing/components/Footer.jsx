import Link from "next/link";
import { lang } from "next/root-params";
import { socials } from "@/lib/site";
import { Wordmark } from "./Editorial";
import { editorial } from "./editorial-copy";
export default async function Footer({ dict }) {
  const locale = await lang();
  const t = editorial(locale);
  return (
    <footer className="site-footer">
      <div className="site-width footer-main">
        <Link href={`/${locale}`} aria-label="ESISA Gaming Club">
          <Wordmark />
        </Link>
        <p>{t.place}</p>
        <div className="footer-socials">
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
          <a href={socials.discord} target="_blank" rel="noopener noreferrer">
            Discord ↗
          </a>
        </div>
      </div>
      <div className="site-width footer-utility">
        <small>© ESISA Gaming Club. {dict.footer.rights}</small>
        <div>
          <Link href={`/${locale}/forms`}>{dict.nav.forms}</Link>
          <Link href={`/${locale}/contact`}>{dict.nav.contact}</Link>
          <a href={socials.twitch} target="_blank" rel="noopener noreferrer">
            Twitch ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

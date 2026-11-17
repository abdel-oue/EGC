import Image from "next/image";
import { lang } from "next/root-params";
import { localized } from "@egc/shared/i18n.js";
import { PageIntro, ClubCta, GamesBand } from "@/components/Editorial";
import { editorial } from "@/components/editorial-copy";
import { getContent } from "@/lib/content";
import { alternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

const crops = {
  "-100": "center 48%",
  "-80": "center 45.4%",
  0: "center 35%",
  90: "center 13.3%",
};
export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.pages.members.title,
    description: dict.pages.members.intro,
    alternates: alternates(await lang(), "/members"),
  };
}
export default async function MembersPage() {
  const locale = await lang();
  const dict = await getDictionary();
  const t = editorial(locale);
  const { rows, unavailable } = await getContent("members");
  const board = rows.slice(0, 4);
  const team = rows.slice(4);
  return (
    <main className="members-page">
      <PageIntro
        eyebrow={t.membersEyebrow}
        lines={t.membersLines}
        intro={t.membersIntro}
        accessibleTitle={dict.pages.members.title}
      />
      <section
        className="members-section site-width"
        aria-label={dict.content.members}
      >
        {unavailable && <p role="status">{dict.content.unavailable}</p>}
        {board.length > 0 && (
          <>
            <h2 className="section-label eyebrow">{t.board}</h2>
            <div className="board-grid">
              {board.map((member) => (
                <article key={member.id} className="portrait-card">
                  <div className="portrait-photo">
                    {member.image_url && (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        unoptimized
                        sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 23vw"
                        style={{
                          objectPosition:
                            crops[member.photo_offset_y] || crops[0],
                        }}
                      />
                    )}
                  </div>
                  <div className="portrait-caption">
                    <span className="accent-rule" />
                    <h3 className="display">{member.name}</h3>
                    <p>{localized(member, "role", locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        {team.length > 0 && (
          <>
            <h2 className="section-label eyebrow">{t.team}</h2>
            <div className="team-directory">
              {team.map((member) => (
                <article key={member.id} className="portrait-card">
                  <div className="portrait-photo">
                    {member.image_url && (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        unoptimized
                        sizes="(max-width: 480px) 90vw, (max-width: 1100px) 44vw, 30vw"
                        style={{
                          objectPosition:
                            crops[member.photo_offset_y] || crops[0],
                        }}
                      />
                    )}
                  </div>
                  <div className="portrait-caption">
                    <span className="accent-rule" />
                    <h3 className="display">{member.name}</h3>
                    <p>{localized(member, "role", locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        {!unavailable && !rows.length && (
          <p className="content-notice">{dict.pages.members.emptyText}</p>
        )}
      </section>
      <ClubCta locale={locale} />
      <GamesBand locale={locale} />
    </main>
  );
}

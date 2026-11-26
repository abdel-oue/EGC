# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added

- Event registrations ask for a phone number and are confirmed in a second step with a 6-digit code emailed from noreply@esisa-gaming.club (2 wrong codes lock the address for 20 minutes).
- Per-event "accept any email" switch; when off, only @esisa.ac.ma addresses can register.
- Solo events (outside Valorant) only ask for name, email and phone.
- Waiting list: a full event keeps its "S'inscrire" button; new entries join the waiting list (shown with their rank in the admin) and staff promote them when a place frees up.
- Tournaments over two days: optional second day (shown on the event page) with its own check-in, listing only players still in the bracket.
- Brackets: match for 3rd place between the semi-final losers, round names ("32es de finale", "16es"… / "Round of 64"…), and an optional score and forfeit on each result, shown on the public bracket.
- Draw wheel: the projector draw screen spins a wheel holding every remaining player; each spin lands on the next drawn player and two players form a match.
- The official logo (icon + "ESISA Gaming Club"), cropped to its drawing, replaces the "EGC." text in the site header and footer and in the admin.
- Live bracket page (`/events/<slug>/bracket`): two-sided layout for big draws (top half from the left, bottom half from the right, final in the centre), full-screen button for the projector, refreshed every minute, with an "Afficher depuis" choice to start at any round (e.g. the 16es on the final day) through to the final. Linked from the event's bracket tab.
- Optional payment deadline per event: unpaid external players are flagged "En retard" in the admin, with a filter.
- Demo data script (`supabase/test-data/fc27-demo.sql`, with its cleanup script) to check registrations, waiting list, check-in, bracket and draw.

- Admin: each event has its own page with tabs (Inscriptions, Tirage au sort, Tableau et résultats, Infos et réglages). Registrations can be searched and filtered (status, ESISA/external, payment, presence), approved or rejected in bulk, exported to CSV, and their emails or phones copied. Staff mark external players as paid and check players in from a phone.
- Admin: live draw. "Lancer le tirage au sort" places approved players at random, and a full-screen projector page reveals the first-round matches one by one.
- Admin: top navigation bar instead of the sidebar, a dashboard with upcoming events (places, to review, unpaid, present) and a to-do list, and an event form grouped in sections with help text and a collapsible English translation.
- Event registration asks for the school (ESISA or another school's name) when other schools are allowed; choosing ESISA requires the @esisa.ac.ma address.
- Optional maximum number of places per event (e.g. 64 players). Event pages and cards show "taken / max" to every visitor. Rejected and waiting-list entries do not take a place.

- Next.js 16 project setup (JavaScript, Tailwind CSS v4, ESLint).
- CLAUDE.md with project conventions.
- Home page in French and English: hero with game picker, about, how to join, season events and FAQ.
- Animated, esports-style design in the club colors: scroll reveals, floating icons, carousels.
- Automatic language redirect, sitemap and robots.txt.
- Events, Teams, Members, Gallery, Join and Contact pages.
- Valorant team registration form (5 players + 1 sub, Riot IDs, ranks), saved to Supabase.

- Separate landing and administration apps with shared branding and validation.
- Member portraits, game galleries, event-specific registrations, and a contact form.
- Staff content management, submission review, invitations, and an activity journal.
- Cloudflare Workers deployment for the landing and admin apps as two separate Workers.
- Project manual in `docs/`: local development, environment and secrets, git workflow, deployment, database and content.
- Upcoming events on the home page, and past events on the events page.
- Event pages show the rules, approved participants (team and in-game names only) and the tournament bracket.
- Staff can generate single-elimination brackets and record match winners from the admin app.
- Valorant Skirmish 2v2 (31 October 2026, 20:00) with open registrations.
- Event pages are split into Info, Standings, Bracket and Rules tabs, each with its own shareable link.
- Standings rank teams by their players' average rank and separate the top seeds (byes) from the play-in teams.
- Brackets are seeded by rank (seed 1 meets the lowest seed) instead of drawn at random, and show play-in, quarterfinal, semifinal and final rounds.
- Staff can pin a team's seed before generating the bracket.
- Events can list cash prizes per place, shown on the Info and Bracket tabs.
- Redesigned dark tournament bracket with connector lines; play-in matches sit next to the match they feed.
- Stream asset list with generation prompts in `docs/stream-assets.md`.
- Rules can be grouped into titled sections; a detailed Skirmish 2v2 rulebook draft is in `docs/valorant-skirmish-rules.md`.
- Forms page with online forms; staff review responses and open or close each form from the admin app.
- First form: application to represent EGC on FIFA at the K-Otaku Gaming Expo (21 November 2026).


### Fixed
- Event card pictures keep their proportions instead of being stretched.
- The "Places" label on event pages no longer shows the prize list.
- Landing pages no longer hang or render empty on Cloudflare Workers, and links navigate correctly.
- Member portraits are visible to the public again.
- Instagram, Discord and Twitch links, with a Discord icon matching the other social icons.

### Changed
- French opens by default regardless of browser language; English remains available.
- Teams pages redirect to members and game events; existing registrations remain available to staff.
- Instagram artwork in `structure/` supplies the visual direction and initial club content.

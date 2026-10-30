# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added

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
- Rules can be grouped into titled sections; a detailed Skirmish 2v2 rulebook draft is in `docs/valorant-skirmish-rules.md`.

### Fixed
- Landing pages no longer hang or render empty on Cloudflare Workers, and links navigate correctly.
- Member portraits are visible to the public again.
- Instagram, Discord and Twitch links, with a Discord icon matching the other social icons.

### Changed
- French opens by default regardless of browser language; English remains available.
- Teams pages redirect to members and game events; existing registrations remain available to staff.
- Instagram artwork in `structure/` supplies the visual direction and initial club content.

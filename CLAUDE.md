# EGC — Esisa Gaming Club Website

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Supabase, deployed on Cloudflare. **JavaScript only.** Bilingual: **French (default) + English**.

@AGENTS.md

## Commands

```bash
npm run dev     # dev server on http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

## Repo structure

```
app/
  [lang]/             # every page lives under the locale segment (fr | en)
    layout.jsx        # root layout: <html lang>, fonts, site-wide metadata
    page.jsx          # home page (/fr, /en)
    dictionaries.js   # getDictionary(): loads the UI strings for the current locale
    dictionaries/     # fr.json, en.json
    <route>/page.jsx  # e.g. app/[lang]/events/page.jsx -> /fr/events
    <route>/_components/  # components used only by that route
  globals.css         # Tailwind import + brand tokens
  sitemap.js          # generates /sitemap.xml
  robots.js           # generates /robots.txt
components/           # components shared across routes (Sidebar, Footer, Reveal, Carousel, HudButton…)
lib/                  # non-UI helpers and constants
  i18n.js             # locales list + default locale (used by proxy.js and dictionaries)
  site.js             # site URL, social links, games list
  motion.js           # literal animation delay class lists
  supabase/           # Supabase clients (server.js, client.js)
public/               # static files served from / (logo, images, icons)
proxy.js              # redirects locale-less URLs (/events -> /fr/events)
brand/                # club brand source files (logos, icons, brand prompts). Source of truth, not served.
.env.example          # every env var the app needs, no real values
CHANGELOG.md          # release notes, newest first
```

Create folders and files when the first thing needs them, not before.
Import with the `@/` alias (`@/components/Navbar`), not long `../../` paths.

## Site map

Every route below exists under both `/fr` and `/en` (e.g. `/fr/events`, `/en/events`).

| Route              | Page                                      |
|--------------------|-------------------------------------------|
| `/`                | Home: hero, next event, latest news       |
| `/events`          | Upcoming and past tournaments/events      |
| `/events/[slug]`   | Event details: date, game, rules, sign-up |
| `/teams`           | Club teams per game                       |
| `/members`         | Committee and members                     |
| `/gallery`         | Photos from events                        |
| `/join`            | How to join + membership form             |
| `/contact`         | Contact info and socials                  |

When you add, rename or remove a page, update this table and `app/sitemap.js`.

## Languages: French + English

- Locales: `fr` (default) and `en`. URLs are always prefixed: `/fr/...`, `/en/...`. Slugs stay in English in both languages.
- `proxy.js` redirects any URL without a locale to the visitor's preferred language (from `Accept-Language`), falling back to `fr`.
- **No hard-coded UI text in components.** Every string goes in `app/[lang]/dictionaries/fr.json` and `en.json` under the same key; read it with `getDictionary()` in Server Components and pass strings down as props to client components.
- Add a key to **both** files in the same commit. French is written first; English is a translation, not the other way round.
- Supabase content that visitors read (event titles, descriptions…) has one column per language: `title_fr`, `title_en`.
- A language switcher in the header links to the same page in the other locale.
- Check French accents and typography (`é`, `è`, `à`, `ç`, space before `: ; ! ?`).
- No i18n library: Next.js built-in pattern (see `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`). Add one only if this becomes painful.

## Code conventions

- **JavaScript only**: `.js` / `.jsx` / `.mjs`. No TypeScript, no `.ts`/`.tsx`, no `tsconfig.json`.
- Use `.jsx` for files that contain JSX and `.js` for everything else.
- Function components only, one main component per file, default export.
- Naming: components `PascalCase.jsx`; helpers and route folders `kebab-case`; variables `camelCase`.
- **Server Components by default.** Add `"use client"` only when a component needs state, effects, event handlers or browser APIs, and push it as far down the tree as possible.
- Use `next/image` for images and `next/link` for internal links.

## Styling

- Tailwind utility classes only. No CSS modules, no inline `style={}`, no new `.css` files.
- Colors, fonts and other design tokens go in `app/globals.css` (`:root` variables plus `@theme inline`). Use them as classes (`bg-offwhite`, `text-accent`) instead of hard-coding hex values in components.
- Mobile-first: write base classes for phones, then add `sm:` / `md:` / `lg:`.
- Light theme only (no `dark:` variants). Dark *sections* (`bg-night`) are fine for rhythm.
- Never build class names at runtime (`` `intro-${i}` ``): Tailwind only generates classes it finds as plain strings. Use a literal list (see `lib/motion.js`).
- Use `overflow-clip`, never `overflow-hidden`, to crop decorations. Hidden containers can still be scrolled sideways by the browser (carousel snapping did exactly that).

## Look & motion

Layout and motion are modeled on primeeleague.com/prime, in EGC colors: fixed dark sidebar, HUD-style chamfered cards and buttons, giant outlined "ghost" text behind headings, carousels with arrow buttons.

- All animation is CSS (keyframes and utilities in `app/globals.css`) plus one tiny client component, `components/Reveal.jsx` (IntersectionObserver). No animation library.
- `intro intro-1…6`: staggered entrance on page load. `<Reveal from="up|left|right|zoom">`: entrance on scroll; stagger with `delay-*` classes.
- `animate-float` / `animate-drift` / `animate-glow` for idle motion; offset rows with `float-delay-1…4`.
- HUD utilities: `chamfer`, `chamfer-sm`, `hud-corners`, `shine`, `bg-grid`, `text-ghost` (set `--ghost` on dark sections).
- Carousels: `components/Carousel.jsx` (native scroll-snap + arrow buttons), no slider library.
- `prefers-reduced-motion` turns all of it off; keep it that way for anything new.

## Brand guide

Source of truth: `brand/` (master rules in `brand/prompts/00-brand-core.md`). If this section and `brand/` disagree, `brand/` wins; update this section.

**Style:** minimalist, professional, esports-org quality. Clean geometry, sharp angles, lots of negative space. "Tech company meets esports team." Not cartoon, not neon, no gradients everywhere.

| Token        | Value     | Use                                                    |
|--------------|-----------|--------------------------------------------------------|
| `accent`     | `#E35205` | Burnt Orange: logo, highlights, CTAs. Max ~15% of a screen |
| `night`      | `#0E0E10` | text on light; dark-mode background                    |
| `offwhite`   | `#F5F3EF` | default page background; text on dark                  |
| `graphite`   | `#2A2A2E` | cards, secondary blocks                                |

- **Theme:** light (Off-White background, Night text, orange accents). Night/Graphite for the sidebar, cards and contrast sections.
- **Never:** purple, neon pink, rainbow/RGB effects, yellow text on white.
- **Fonts:** headings **Space Grotesk Bold, UPPERCASE, tight letter-spacing**; body **Inter** Regular/Medium. Max 2 fonts. Load both with `next/font/google` in the root layout.
- **Logo:** official files only, never redrawn, stretched, rotated, shadowed or glowing. Orange on dark backgrounds; orange or Night on light. Clear space around it = height of the "E".
  - **Icon (crest):** `brand/svg/cropped/icon/icon.svg` — favicon, avatars, small spaces.
  - **Full logo (crest + wordmark):** `brand/svg/cropped/Untitled (15).svg` — header, footer, hero.
  - PNG versions in `brand/png/`. Other `Untitled (*).svg` files in `brand/svg/cropped/` are drafts; don't use them.
  - The source SVGs are filled black, so the site uses pre-colored copies in `public/brand/`: `logo-full.svg` / `logo-icon.svg` (orange) and `logo-full-night.svg` / `logo-icon-night.svg` (Night). Game icons are copied to `public/brand/games/`. `app/icon.svg` is the favicon. Don't serve from `brand/`.
  - To add a color: `sed 's/fill="#000000"/fill="#HEX"/' brand/svg/cropped/icon/icon.svg > public/brand/logo-icon-<name>.svg`.
- **Game icons:** `brand/game-icons/` (Valorant, League, FC, Minecraft, Discord), SVG + PNG, same visual family as the crest.
- **Graphic elements:** angled cuts at the same slant as the logo letters, thin orange lines, subtle grid, small HUD-style corner brackets `[ ]`.
- **Photos:** real members, events and setups with a slight dark overlay. No stock photos.
- **Tone of voice:** confident, short, energetic but not childish. Max 1–2 emojis on a page, ideally none.

Every color and font above must exist as a token in `app/globals.css` (`--color-accent`, `--color-night`, …); components use the token (`bg-accent`, `text-night`), never the raw hex value.

## Data: Supabase

- Supabase (Postgres) holds dynamic content: events, teams, members, gallery, sign-ups.
- Use `@supabase/ssr`. Two clients in `lib/supabase/`:
  - `server.js` — for Server Components, Server Actions and Route Handlers (the default).
  - `client.js` — for `"use client"` components only, when data must load in the browser.
- Read data in Server Components; write with Server Actions. Don't build API routes just to proxy Supabase.
- **Row Level Security (RLS) is on for every table.** Public read policies for public content; writes only for authenticated admins.
- Schema changes go through migrations in `supabase/migrations/` (Supabase CLI), never hand-edited in the dashboard only.
- The secret / service-role key is server-only. Never import it in a client component or prefix it with `NEXT_PUBLIC_`.

## Environment variables

- `.env.example` lists every variable with an empty or dummy value and is committed.
- Real values go in `.env.local` (git-ignored) for development and in Cloudflare for production.
- `NEXT_PUBLIC_*` variables are inlined into the browser bundle at **build time**: only put public values there, and they must be set in the build environment, not just at runtime.
- When you add a variable, add it to `.env.example` and the table below in the same commit.

| Variable                                | Where        | Purpose                          |
|-----------------------------------------|--------------|----------------------------------|
| `NEXT_PUBLIC_SITE_URL`                  | public       | canonical site URL (SEO, sitemap)|
| `NEXT_PUBLIC_SUPABASE_URL`              | public       | Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | public       | Supabase publishable (anon) key  |
| `SUPABASE_SECRET_KEY`                   | server only  | admin tasks that bypass RLS      |

## SEO

- Site-wide defaults in `app/[lang]/layout.jsx`: `metadataBase` (from `NEXT_PUBLIC_SITE_URL`), title template (`"%s | EGC"`), description, Open Graph defaults.
- Every page exports `generateMetadata` with its own title and description **in the page's language**, plus `alternates.languages` pointing to the `fr` and `en` versions (hreflang).
- `app/sitemap.js` lists every public route in both locales, including each event from Supabase. `app/robots.js` allows all and points to the sitemap.
- Open Graph image: `app/opengraph-image.png` (1200x630) site-wide; events can have their own.
- One `<h1>` per page, real `alt` text on every image, semantic HTML (`<main>`, `<nav>`, `<section>`).

## Deployment: Cloudflare

- Hosted on Cloudflare Workers using the OpenNext adapter (`@opennextjs/cloudflare`) + `wrangler`. <!-- TODO: set up adapter + wrangler config on first deploy -->
- `main` deploys to production automatically. Every PR gets a preview URL.
- Env vars and secrets are set in the Cloudflare dashboard (or `wrangler secret put`); `NEXT_PUBLIC_*` ones must also be available at build time.
- Not every Node.js API works on Workers. Before using a Node-only package or API, check it's supported by the Workers runtime.

## Git workflow

- `main` is always deployable. Never commit straight to it.
- Branch per change: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Merge into `main` through a pull request.

### Commit messages: Conventional Commits

```
<type>(<optional scope>): <short imperative summary>
```

| type       | use for                                   |
|------------|-------------------------------------------|
| `feat`     | new feature or page                       |
| `fix`      | bug fix                                   |
| `style`    | visual/CSS-only change, no logic          |
| `refactor` | code change with no behaviour change      |
| `docs`     | README, CLAUDE.md, comments               |
| `chore`    | deps, config, tooling                     |

Examples: `feat(events): add upcoming tournaments page`, `fix(navbar): close menu on link click`.
Keep commits small and focused; one logical change per commit.

## Versioning: SemVer

The version lives in `package.json` (`MAJOR.MINOR.PATCH`). It is bumped on release, not on every commit:

- `fix` commits only -> **patch** (0.1.0 -> 0.1.1)
- any `feat` -> **minor** (0.1.0 -> 0.2.0)
- breaking change (`feat!:` or a `BREAKING CHANGE:` footer) -> **major**

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com): newest version first, entries grouped under **Added** (`feat`), **Fixed** (`fix`), **Changed** (`refactor`, `style`, notable `chore`). Skip `docs` and minor `chore` commits.

Write entries for people, not machines: "Added tournament sign-up form", not the raw commit message.

## Releasing

From an up-to-date `main` (the release commit is the only direct commit allowed on `main`):

1. Read the commits since the last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline` (first release: `git log --oneline`).
2. Pick the bump (patch / minor / major) from the rules above.
3. Move the `## [Unreleased]` entries in `CHANGELOG.md` under a new `## [X.Y.Z] - YYYY-MM-DD` heading and `git add CHANGELOG.md`.
4. `npm version <patch|minor|major>` — bumps `package.json`, commits the staged changelog with it, tags `vX.Y.Z`.
5. `git push --follow-tags`.

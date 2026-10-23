# EGC development conventions

Read `AGENTS.md` and the installed Next.js guides before changing framework code. This repository uses Next.js 16.4.2 with breaking changes from earlier versions.

## Architecture

- `apps/landing`: public website with `/fr` and `/en` locale routes. French is always the default for unprefixed paths.
- `apps/admin`: invite-only French staff app, with active manager/admin roles checked on every server action and protected data read.
- `packages/shared`: translation dictionaries, admin labels, brand tokens/fonts, validation, resource definitions, Supabase client factories, and initial content manifest.
- `supabase/migrations`: database schema, submission RPC functions, audit triggers, RLS and storage policies. Preserve legacy registrations.
- `structure/`: original brand and Instagram artwork. Member metadata comes from `structure/Insta/team-members/content.json`.

Use JavaScript (`.js`, `.jsx`, `.mjs`), readable multiline functions and JSX, and `@/` aliases within each app. Server Components are the default. Server Actions handle mutations; do not add proxy API routes for Supabase CRUD. Never trust browser registration settings or staff roles.

Use the shared theme: off-white #F5F3EF, Night #0E0E10, Burnt Orange #E35205, Graphite #2A2A2E. Use the provided logo, Space Grotesk for headings, and Inter for body text. Tailwind utilities and tokens only; extend existing globals when necessary. No CSS modules, inline styles, neon effects, or replacement logos. Preserve reduced-motion behavior and use `overflow-clip` for decorations.

All public UI text belongs in both shared dictionaries. French comes first; English is its translation. Admin UI labels belong in the shared admin dictionary. Use original member photos and actual club media; identify promotions as such.

Landing uses Cache Components. Short-lived public database reads stream after `connection()` and cache for at most 60 seconds. Keep request hooks under Suspense boundaries. Admin is request-rendered and never shares cached authenticated data. Use the installed guides for `next/root-params`, `generateStaticParams`, `cacheLife`, proxy, auth and Server Actions.

Use migrations for all schema changes. RLS protects every data table. Public visitors may read published content and submit through validated RPC functions; only active staff can read submissions or modify content. Only administrators manage staff. The service secret is server-only and used only after admin authorization.

## Commands and delivery

Run commands from the root: `npm run dev`, `npm run dev:admin`, `npm run lint`, `npm test`, `npm run build`, `npm run test:browser`. See README.md for environment, migration, seeding, first-admin and deployment instructions. App environment files live inside each app; the old root `.env` is not automatically loaded.

Use a feature branch and Conventional Commits; do not commit directly to main. Update the changelog for user-visible changes. Update the sitemap when public routes change, and keep admin routes excluded from indexing. Run relevant checks and both builds before delivery. Never apply remote migrations, send invitations, or deploy without user authorization for those external actions.

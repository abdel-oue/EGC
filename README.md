# ESISA Gaming Club

Two Next.js 16.4.2 applications, React 19, JavaScript, Tailwind CSS v4, and one shared Supabase project.

- `apps/landing`: public French/English website, port 3000.
- `apps/admin`: French staff dashboard, port 3001.
- `packages/shared`: translations, branding, fonts, validation, content seeds, and Supabase clients.
- `supabase/migrations`: ordered database and storage access migrations.
- `structure/`: original club artwork, portraits, and branding sources. The app does not serve this whole directory.

## Local development

Use Node.js 22 or newer and npm 11. Install from the repository root:

```powershell
npm install
Copy-Item apps/landing/.env.example apps/landing/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
npm run dev
```

In a second terminal, run `npm run dev:admin`. Fill in each app’s environment file with the same Supabase URL and publishable key. The root `.env` file is not automatically loaded by the two app processes. Put `SUPABASE_SECRET_KEY` only in the admin environment; it is used for invitations after the caller passes administrator authorization.

Without Supabase configuration, the landing app displays the imported members and promotional artwork, and explains that events and submissions are unavailable. It does not pretend that forms succeeded. A configured database is the source of truth, including deliberately empty or hidden content.

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests use production builds on dedicated ports 3100 and 3101. Run them with empty Supabase settings to check offline fallback behavior. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an existing Chromium installation. Database tests use embedded PostgreSQL with minimal Supabase auth/storage scaffolding and exercise the actual migration SQL and RLS policies. They do not contact production.

## Database setup and initial content

Apply both migrations, in order, to the intended development Supabase project using your normal Supabase CLI migration workflow (`supabase link`, then `supabase db push`). Review the target project before applying. The second migration preserves `team_registrations` and closes its retired anonymous write policy. Staff can still review those records under “Anciennes inscriptions”.

Import the initial members, media, and draft calendar:

```powershell
node --env-file=apps/admin/.env.local scripts/seed.mjs
```

The seed is repeatable: it inserts missing IDs/slugs and skips existing content, preserving staff edits. It uploads original portraits and the selected white Valorant poster into the private `club-media` bucket. Run `node scripts/prepare-assets.mjs` only when intentionally updating the source artwork import; it rebuilds local preview copies and the shared initial-content manifest.

All imported events are drafts with registrations disabled. Calendar dates without a precise day use the first day of their indicated month at 18:00 as an editorial placeholder. The October 24 Valorant event uses 18:00 as an unconfirmed time and two-player team registration. Staff must confirm timing, description, and format before publishing. No imported legacy submission is assigned to it.

## Staff accounts

1. Disable public account sign-up in Supabase Auth.
2. Create the first user in the Supabase Auth dashboard, set a strong password, and confirm the email.
3. Run this one-time SQL using the actual account email:

```sql
insert into public.staff_profiles (user_id, email, role, active)
select id, email, 'admin', true
from auth.users
where lower(email) = lower('your-admin@example.com')
on conflict (user_id) do nothing;
```

4. Log in at the admin app. Invite additional staff from “Accès du bureau”. Managers can manage all submissions and club content. Only administrators manage staff roles and access. The database prevents removal of the last active administrator.

Configure the admin origin as the Supabase Auth Site URL and allow its `/auth/callback`, `/auth/confirm`, and `/reset-password` redirect URLs. Configure production SMTP in Supabase for reliable invitations and recovery. Set the invitation email link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Activer mon accès</a>
```

Use the same template pattern with `type=recovery` for password recovery. These token-hash links also work when opened on another device. A PKCE callback handler is provided for standard code-based recovery. Invited staff set their password on `/reset-password`; there is no public signup screen.

## Content and submissions

Public routes remain prefixed with `/fr` or `/en`. Unprefixed URLs always redirect to French. `/teams` redirects to Members; `/teams/register/[game]` redirects to that game’s events section. The sitemap contains public pages, four game galleries, and published event details.

Events store translated titles/descriptions, an absolute start timestamp, location, draft/published/archived status, a registration switch and optional time window, individual/team entry, player count, and substitute count. Admin date inputs are interpreted in `Africa/Casablanca`, including Ramadan offset changes.

Contact messages use new/in-progress/resolved; registrations use pending/approved/rejected. Public writes run through database functions that revalidate registration settings at submission time. Duplicate event emails and team names are blocked. Contact submissions are limited to five per email per hour. Both forms also have a honeypot. Staff status changes and content/access changes create private audit entries.

Images accept JPEG, PNG, or WebP up to 8 MiB. Uploads require active staff; the server checks size, MIME type, and file signatures. Storage is private. Anonymous users can obtain signed URLs only for visible members or visible gallery media whose associated event is published. Existing signed URLs can remain usable for up to one hour after unpublishing; database visibility changes appear on new site requests within at most 60 seconds. Unchanged open pages need a navigation or reload to show edits. Do not use club media storage for confidential attachments.

Content editing includes publishing/archiving events, opening/closing registrations, reordering/hiding members, portrait framing presets, uploading/reordering/hiding gallery media, and associating media with games or events. Staff can search content titles/names, filter submissions by email/status/event, and page through lists. Contact replies happen outside the app. Recruitment applications, payments, and email message alerts are deferred.

## Deployment

Build from the repository root so npm workspaces and shared package imports resolve:

```powershell
npm ci
npm run build:landing
npm run build:admin
```

Deploy each app separately with its own domain and environment. Standard Node deployments run `npm run start` and `npm run start:admin`. Set the public site/admin URLs to their real origins and configure Supabase redirect URLs accordingly. `NEXT_PUBLIC_*` values must be available at build time. The admin secret stays server-only. Admin responses are private/no-store and excluded from indexing.

Cloudflare hosting is documented as the intended target in the original project, but the repository does not yet contain an OpenNext adapter or Wrangler deployment configuration. For Workers deployment, add and validate the compatible OpenNext integration for each app before publishing; `next start` is the verified Node deployment path in this change.

Roll out database migrations first, seed content, bootstrap an administrator, verify access and preview both apps, then deploy the landing and admin apps. Do not publish draft events until their details are confirmed. Review server logs for failed public content reads and submission errors, and use the admin activity journal for staff changes. This change does not apply production migrations, send invitations, or deploy either app.

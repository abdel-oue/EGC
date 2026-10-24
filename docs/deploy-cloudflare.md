# Deploying to Cloudflare Workers

[← Back to the manual](../README.md)

The two apps are two separate Workers, built with the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare):

| App     | Worker name   | Config                                                   |
| ------- | ------------- | -------------------------------------------------------- |
| Landing | `egc-landing` | [apps/landing/wrangler.jsonc](../apps/landing/wrangler.jsonc) |
| Admin   | `egc-admin`   | [apps/admin/wrangler.jsonc](../apps/admin/wrangler.jsonc)     |

Run every command below from the repository root unless it says otherwise.

## Order of a full release

1. Merge to `main` ([Git workflow](git-workflow.md)).
2. Apply database migrations if there are new ones ([Database](database.md)).
3. Preview both Workers locally.
4. Deploy landing, then admin.
5. Smoke-test both live URLs.

## First-time setup (once per machine)

```powershell
npx wrangler login     # opens the browser to authorize your Cloudflare account
npx wrangler whoami    # confirms which account you're on
```

Create the env files described in [Environment variables and secrets](environment.md). **Delete the root `.env` first**, otherwise the admin secret is compiled into the landing Worker.

## First-time setup (once per Worker)

Create the landing cache bucket before the first landing deploy:

```powershell
npx wrangler r2 bucket create egc-landing-opennext-cache
```

Deploy each Worker once (see below), then set the admin secret:

```powershell
cd apps/admin
npx wrangler secret put SUPABASE_SECRET_KEY
cd ../..
```

Then, in the Cloudflare dashboard → **Workers & Pages** → each Worker → **Settings → Domains & Routes**, add a custom domain, e.g.:

- `egc-landing` → `esisa-gaming.club` (and optionally `www.esisa-gaming.club`)
- `egc-admin` → `admin.esisa-gaming.club`

Afterwards:

- Production URLs live in `apps/landing/.env.production.local` and `apps/admin/.env.production.local` (git-ignored). Builds and deploys read these; local dev keeps using `.env.local` with localhost. If either file is missing, create it:

  ```
  # apps/landing/.env.production.local
  NEXT_PUBLIC_SITE_URL=https://esisa-gaming.club

  # apps/admin/.env.production.local
  NEXT_PUBLIC_SITE_URL=https://esisa-gaming.club
  NEXT_PUBLIC_ADMIN_URL=https://admin.esisa-gaming.club
  ```

  Redeploy both Workers after changing them.
- In Supabase Auth, set the Site URL to the admin domain and allow `/auth/callback`, `/auth/confirm` and `/reset-password` on it ([Database and staff accounts](database.md#staff-accounts)).

## Preview locally (Workers runtime)

```powershell
npm run preview:landing
npm run preview:admin
```

These build the app for Workers and serve it on a local URL printed in the terminal. Use this to catch Workers-only problems before deploying.

## Deploy

```powershell
git checkout main
git pull
npm run deploy:landing
npm run deploy:admin
```

Each command builds that app and uploads it to its own Worker. The deploy output prints the `*.workers.dev` URL.

## Logs, history and rollback

Run these from inside the app folder (`apps/landing` or `apps/admin`):

```powershell
npx wrangler tail                 # live logs
npx wrangler deployments list     # deployment history
npx wrangler rollback             # revert to the previous deployment
```

## Optional: automatic deploys (Workers Builds)

In the Cloudflare dashboard, open each Worker → **Settings → Build** → connect `abdel-oue/EGC`:

| Setting          | Landing                  | Admin                  |
| ---------------- | ------------------------ | ---------------------- |
| Branch           | `main`                   | `main`                 |
| Root directory   | `/`                      | `/`                    |
| Deploy command   | `npm run deploy:landing` | `npm run deploy:admin` |
| Build variables  | the landing `NEXT_PUBLIC_*` values | the admin `NEXT_PUBLIC_*` values |

The Worker name in the dashboard must match the `name` in that app's `wrangler.jsonc`. Check the first automated build log to confirm it worked.

## Notes and limits

- The landing Worker uses the Cloudflare Images binding (`IMAGES`) to resize images for `next/image`.
- Landing uses an R2 incremental cache (`egc-landing-opennext-cache`) for prerendered page shells and `"use cache"` entries. Without it, every landing page hangs on Workers. `preview` and `deploy` fill it automatically.
- The OpenNext config files are JavaScript (`open-next.config.mjs`), so the build scripts pass `--openNextConfigPath open-next.config.mjs`.
- OpenNext warns that builds made on Windows may fail at runtime. Prefer building from WSL or from Workers Builds (Linux).

## ⚠️ Known issue: landing dynamic sections (October 2026)

Tested with Next.js 16.4.2 and `@opennextjs/cloudflare` 1.20.13 (built on Windows): admin works on Workers. Landing pages return 200, but only their prerendered shell renders. Database-driven sections streamed after `connection()` (members, events, galleries) never arrive. Next.js logs that it "cannot guarantee that Cache Components will run as expected due to the current runtime's implementation of `setTimeout()`". The same build works under `next start`. Do not deploy landing to Workers until a preview shows those sections.
- Admin is request-rendered and never shares cached authenticated data.
- Build output (`.open-next/`, `.wrangler/`) is git-ignored.

## Other hosts

Standard Node hosting also works: `npm run build:landing` / `npm run build:admin`, then `npm run start` / `npm run start:admin`.

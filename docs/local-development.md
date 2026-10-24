# Local development

[← Back to the manual](../README.md)

Use Node.js 22 or newer and npm 11. Install from the repository root:

```powershell
npm install
Copy-Item apps/landing/.env.example apps/landing/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
npm run dev
```

In a second terminal, run `npm run dev:admin`. Fill in each app's environment file with the same Supabase URL and publishable key. The root `.env` file is not automatically loaded by the two app processes. Put `SUPABASE_SECRET_KEY` only in the admin environment; it is used for invitations after the caller passes administrator authorization. See [Environment variables and secrets](environment.md).

| App     | URL                   |
| ------- | --------------------- |
| Landing | http://localhost:3000 |
| Admin   | http://localhost:3001 |

Without Supabase configuration, the landing app displays the imported members and promotional artwork, and explains that events and submissions are unavailable. It does not pretend that forms succeeded. A configured database is the source of truth, including deliberately empty or hidden content.

## Checks

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests use production builds on dedicated ports 3100 and 3101. Run them with empty Supabase settings to check offline fallback behavior. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an existing Chromium installation. Database tests use embedded PostgreSQL with minimal Supabase auth/storage scaffolding and exercise the actual migration SQL and RLS policies. They do not contact production.

## Troubleshooting

**`EPERM` / `ENOTEMPTY` during `npm install` on Windows.** A running dev server or editor is locking files in `node_modules`. Stop `npm run dev` / `dev:admin`, then reinstall cleanly:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

**`Cannot find module ... node_modules/...`** after an interrupted install means the same thing: reinstall cleanly as above.

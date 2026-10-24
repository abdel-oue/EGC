# ESISA Gaming Club

Two Next.js 16.4.2 applications, React 19, JavaScript, Tailwind CSS v4, and one shared Supabase project. Each app deploys as its own Cloudflare Worker.

- `apps/landing`: public French/English website, port 3000.
- `apps/admin`: French staff dashboard, port 3001.
- `packages/shared`: translations, branding, fonts, validation, content seeds, and Supabase clients.
- `supabase/migrations`: ordered database and storage access migrations.
- `structure/`: original club artwork, portraits, and branding sources. The app does not serve this whole directory.
- `docs/`: the manual below.

## Quick start

```powershell
npm install
Copy-Item apps/landing/.env.example apps/landing/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
npm run dev          # landing → http://localhost:3000
npm run dev:admin    # admin   → http://localhost:3001 (second terminal)
```

## Manual

| Guide                                                          | Read it when you want to…                              |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| [Local development](docs/local-development.md)                 | install, run the apps, run tests, fix install errors   |
| [Environment variables and secrets](docs/environment.md)       | know which value goes in which file, keep secrets safe |
| [Git workflow](docs/git-workflow.md)                           | branch, commit, push, open and merge a pull request    |
| [Deploying to Cloudflare Workers](docs/deploy-cloudflare.md)   | preview, deploy, add domains, read logs, roll back     |
| [Database, seeding and staff accounts](docs/database.md)       | apply migrations, seed content, create the first admin |
| [Content and submissions](docs/content.md)                     | understand events, registrations, media and limits     |

## Everyday commands

| Command                   | Does                                         |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | Landing dev server                           |
| `npm run dev:admin`       | Admin dev server                             |
| `npm run lint`            | Lint everything                              |
| `npm test`                | Unit and database tests                      |
| `npm run build`           | Production build of both apps                |
| `npm run test:browser`    | Playwright browser tests                     |
| `npm run preview:landing` | Run landing in the local Workers runtime     |
| `npm run preview:admin`   | Run admin in the local Workers runtime       |
| `npm run deploy:landing`  | Build and deploy the `egc-landing` Worker    |
| `npm run deploy:admin`    | Build and deploy the `egc-admin` Worker      |

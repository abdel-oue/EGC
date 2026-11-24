# Environment variables and secrets

[← Back to the manual](../README.md)

Each app reads its own env file. The old root `.env` is not loaded by `npm run dev`, and it should be deleted (see the warning below).

| Variable                               | Landing | Admin | Notes                                  |
| -------------------------------------- | :-----: | :---: | -------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 |   yes   |  yes  | Public site origin                     |
| `NEXT_PUBLIC_ADMIN_URL`                |         |  yes  | Admin origin                           |
| `NEXT_PUBLIC_SUPABASE_URL`             |   yes   |  yes  | Same project for both apps             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |   yes   |  yes  | Safe for browsers                      |
| `SUPABASE_SECRET_KEY`                  | **never** | yes | Server only, used for staff invitations |
| `RESEND_API_KEY`                       |   yes   |       | Server only, sends registration codes  |
| `RESEND_FROM`                          |   yes   |       | e.g. `ESISA Gaming Club <noreply@esisa-gaming.club>`; domain must be verified in Resend |
| `REGISTRATION_CODE_SECRET`             |   yes   |       | Server only; must equal the Vault secret below |

### Registration email codes

Event registrations require a 6-digit code emailed through Resend. The database checks the code itself, so it needs the same secret as the landing server. Run once in the Supabase SQL editor after applying `20261124000000_verified_registrations.sql`:

```sql
select vault.create_secret('<same value as REGISTRATION_CODE_SECRET>', 'registration_code_secret');
```

Generate the value with `openssl rand -hex 32`. In production, store the three landing secrets with `npx wrangler secret put <NAME>` from `apps/landing`.

Templates: [apps/landing/.env.example](../apps/landing/.env.example) and [apps/admin/.env.example](../apps/admin/.env.example).

## Where values go

| Situation                    | Landing                     | Admin                                                    |
| ---------------------------- | --------------------------- | -------------------------------------------------------- |
| Local dev                    | `apps/landing/.env.local`   | `apps/admin/.env.local`                                  |
| Cloudflare build (`NEXT_PUBLIC_*`) | `apps/landing/.env.local` | `apps/admin/.env.local`                              |
| Cloudflare runtime secret    | none                        | `npx wrangler secret put SUPABASE_SECRET_KEY` (from `apps/admin`) |

`NEXT_PUBLIC_*` values are baked into the build, so they must be present when you build. Changing them requires a new deploy.

## Secrets stay out of the Worker bundle

The OpenNext build copies every value from the root and app `.env*` files into `.open-next/cloudflare/next-env.mjs`. Both `npm run deploy:*` scripts run [scripts/strip-worker-env.mjs](../scripts/strip-worker-env.mjs) between build and upload, which keeps only `NEXT_PUBLIC_*` values. Server-only values (`SUPABASE_SECRET_KEY`, `RESEND_*`, `REGISTRATION_CODE_SECRET`) can therefore stay in `.env.local` for local dev, and production reads them only from `wrangler secret put`.

Still:

- Never put `SUPABASE_SECRET_KEY` in any `apps/landing/.env*` file or the root `.env`.
- Deploy only through `npm run deploy:landing` / `npm run deploy:admin`. Running `opennextjs-cloudflare deploy` directly skips the strip step.
- `npm run preview:*` does not strip, so preview builds still contain those values locally.

Env files are git-ignored (`.env`, `.env*.local`, `.dev.vars*`). Never commit them.

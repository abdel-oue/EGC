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

## ⚠️ Secret leaking into a Worker

The Cloudflare build compiles every value from the **root** `.env*` files **and** the app's own `.env*` files into that Worker's server code. A Cloudflare secret overrides the compiled value at runtime, but the compiled copy is still inside the uploaded bundle.

So:

- **Delete the root `.env`** (or at least remove `SUPABASE_SECRET_KEY` from it). Otherwise the admin secret ends up inside the **landing** Worker.
- Never put `SUPABASE_SECRET_KEY` in any `apps/landing/.env*` file.
- For admin, prefer `wrangler secret put`. Remove the secret from `apps/admin/.env.local` before deploying if you don't want it in the bundle; local dev without it only disables invitations.

Env files are git-ignored (`.env`, `.env*.local`, `.dev.vars*`). Never commit them.

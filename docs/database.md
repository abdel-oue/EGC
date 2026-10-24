# Database, seeding and staff accounts

[← Back to the manual](../README.md)

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

## Production rollout

Roll out database migrations first, seed content, bootstrap an administrator, verify access and preview both apps, then deploy the landing and admin apps ([Deploying to Cloudflare Workers](deploy-cloudflare.md)). Do not publish draft events until their details are confirmed. Review server logs for failed public content reads and submission errors, and use the admin activity journal for staff changes.

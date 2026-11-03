# Content and submissions

[← Back to the manual](../README.md)

Public routes remain prefixed with `/fr` or `/en`. Unprefixed URLs always redirect to French. `/teams` redirects to Members; `/teams/register/[game]` redirects to that game’s events section. The sitemap contains public pages, four game galleries, and published event details.

Events store translated titles/descriptions, an absolute start timestamp, location, draft/published/archived status, a registration switch and optional time window, individual/team entry, player count, and substitute count. Admin date inputs are interpreted in `Africa/Casablanca`, including Ramadan offset changes.

Contact messages use new/in-progress/resolved; registrations use pending/approved/rejected. Public writes run through database functions that revalidate registration settings at submission time. Duplicate event emails and team names are blocked. Contact submissions are limited to five per email per hour. Both forms also have a honeypot. Staff status changes and content/access changes create private audit entries.

Images accept JPEG, PNG, or WebP up to 8 MiB. Uploads require active staff; the server checks size, MIME type, and file signatures. Storage is private. Anonymous users can obtain signed URLs only for visible members or visible gallery media whose associated event is published. Existing signed URLs can remain usable for up to one hour after unpublishing; database visibility changes appear on the next page load. Unchanged open pages need a navigation or reload to show edits. Do not use club media storage for confidential attachments.

Content editing includes publishing/archiving events, opening/closing registrations, reordering/hiding members, portrait framing presets, uploading/reordering/hiding gallery media, and associating media with games or events. Staff can search content titles/names, filter submissions by email/status/event, and page through lists. Contact replies happen outside the app. Payments and email message alerts are deferred.

## Forms

`/forms` lists published forms and `/forms/[slug]` renders one. A form is a row in `forms`: translated title, description and post-submit message, status, optional closing date, and a `fields` list. Field types are `text`, `textarea`, `phone`, `choice` and `consent`. To add a form, write a migration that inserts a row (see `20261103000000_forms.sql`); no code change is needed. The field `name` is shown as the response's title in the admin list, and the first `phone` field limits a form to one response per number.

`submit_form` checks answers against `fields` in the database, drops unknown answers, and normalized phone numbers must start with the country code. Staff change wording, status and closing date under “Formulaires”, and review responses under “Réponses aux formulaires” (pending/approved/rejected). Question lists are not editable in the admin app. Only published forms are public: archiving hides a form and its link, while a passed closing date keeps it listed as closed.

## Rules, participants and brackets

Each event has optional rules in French and English (one rule per line). They appear on the event page and above the registration form, whose checkbox confirms acceptance. The registration format is set by **Type d’inscription** and **Joueurs obligatoires**: individual, or a team of 2, 3, 5… players, plus optional substitutes.

Approved registrations are public on the event page: team name and in-game names only. Emails, full names and Discord tags stay staff-only.

From an event's edit page, **Tableau du tournoi** generates a single-elimination bracket from approved registrations, with random seeding and automatic byes. Staff then pick each match's winner, and the winner moves to the next round. Correcting a result clears the later results that depended on it. Regenerating requires confirmation and erases all results. The public event page shows the bracket on the next page load.

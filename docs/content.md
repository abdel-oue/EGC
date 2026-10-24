# Content and submissions

[← Back to the manual](../README.md)

Public routes remain prefixed with `/fr` or `/en`. Unprefixed URLs always redirect to French. `/teams` redirects to Members; `/teams/register/[game]` redirects to that game’s events section. The sitemap contains public pages, four game galleries, and published event details.

Events store translated titles/descriptions, an absolute start timestamp, location, draft/published/archived status, a registration switch and optional time window, individual/team entry, player count, and substitute count. Admin date inputs are interpreted in `Africa/Casablanca`, including Ramadan offset changes.

Contact messages use new/in-progress/resolved; registrations use pending/approved/rejected. Public writes run through database functions that revalidate registration settings at submission time. Duplicate event emails and team names are blocked. Contact submissions are limited to five per email per hour. Both forms also have a honeypot. Staff status changes and content/access changes create private audit entries.

Images accept JPEG, PNG, or WebP up to 8 MiB. Uploads require active staff; the server checks size, MIME type, and file signatures. Storage is private. Anonymous users can obtain signed URLs only for visible members or visible gallery media whose associated event is published. Existing signed URLs can remain usable for up to one hour after unpublishing; database visibility changes appear on new site requests within at most 60 seconds. Unchanged open pages need a navigation or reload to show edits. Do not use club media storage for confidential attachments.

Content editing includes publishing/archiving events, opening/closing registrations, reordering/hiding members, portrait framing presets, uploading/reordering/hiding gallery media, and associating media with games or events. Staff can search content titles/names, filter submissions by email/status/event, and page through lists. Contact replies happen outside the app. Recruitment applications, payments, and email message alerts are deferred.

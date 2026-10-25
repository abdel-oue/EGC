alter table public.events
  add column rules_fr text not null default '',
  add column rules_en text not null default '';

-- Public media checks run as the definer so they do not depend on RLS inside storage policies.
create function public.media_is_public(object_name text)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from members where image_path = object_name and visible) or
    exists (select 1 from gallery_media media where media.image_path = object_name and media.visible and
      (media.event_id is null or exists (select 1 from events where id = media.event_id and status = 'published')));
$$;
revoke all on function public.media_is_public(text) from public;
grant execute on function public.media_is_public(text) to anon, authenticated;

drop policy published_media on storage.objects;
create policy published_media on storage.objects for select to anon, authenticated
using (bucket_id = 'club-media' and public.media_is_public(name));

-- Approved entries of published events, without contact details.
create function public.event_participants(target_event uuid)
returns table (id uuid, team_name text, players text[])
language sql stable security definer
set search_path = public as $$
  select registration.id, registration.team_name,
    array(select player->>'handle' from jsonb_array_elements(registration.players) player)
  from event_registrations registration
  join events on events.id = registration.event_id
  where registration.event_id = target_event and registration.status = 'approved' and events.status = 'published'
  order by registration.created_at;
$$;
revoke all on function public.event_participants(uuid) from public;
grant execute on function public.event_participants(uuid) to anon, authenticated;

create table public.event_matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  round integer not null check (round between 1 and 10),
  position integer not null check (position >= 0),
  team_a uuid references public.event_registrations(id) on delete set null,
  team_b uuid references public.event_registrations(id) on delete set null,
  winner uuid references public.event_registrations(id) on delete set null,
  unique (event_id, round, position),
  check (winner is null or winner = team_a or winner = team_b)
);

alter table public.event_matches enable row level security;
create policy public_matches on public.event_matches for select to anon, authenticated
using (exists (select 1 from public.events where id = event_id and status = 'published'));
create policy staff_matches on public.event_matches for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create trigger audit_change after insert or update or delete on public.event_matches
for each row execute function public.audit_staff_change();

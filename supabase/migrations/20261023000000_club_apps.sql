create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create function public.is_staff(required_role text default null)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from staff_profiles
    where user_id = auth.uid() and active
      and (required_role is null or role = required_role)
  );
$$;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  game text check (game in ('valorant', 'minecraft', 'league', 'fc')),
  title_fr text not null check (char_length(title_fr) between 2 and 150),
  title_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  starts_at timestamptz not null,
  location text not null default 'ESISA, Fès',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  registration_enabled boolean not null default false,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  entry_type text not null default 'individual' check (entry_type in ('individual', 'team')),
  player_count integer not null default 1 check (player_count between 1 and 20),
  substitute_count integer not null default 0 check (substitute_count between 0 and 5),
  created_at timestamptz not null default now(),
  check (entry_type <> 'individual' or player_count = 1),
  check (registration_opens_at is null or registration_closes_at is null or registration_opens_at < registration_closes_at),
  check (registration_closes_at is null or registration_closes_at <= starts_at)
);

create table public.members (
  id text primary key,
  name text not null check (char_length(name) between 2 and 100),
  role_fr text not null,
  role_en text not null default '',
  image_path text,
  photo_offset_y integer not null default 0,
  sort_order integer not null default 0,
  visible boolean not null default true
);

create table public.gallery_media (
  id text primary key,
  game text check (game in ('valorant', 'minecraft', 'league', 'fc')),
  event_id uuid references public.events(id) on delete set null,
  caption_fr text not null,
  caption_en text not null default '',
  image_path text not null,
  kind text not null default 'photo' check (kind in ('photo', 'promotion')),
  sort_order integer not null default 0,
  visible boolean not null default false
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 120),
  discord text not null check (char_length(discord) between 2 and 80),
  team_name text check (char_length(team_name) between 2 and 80),
  players jsonb not null,
  rules_accepted boolean not null check (rules_accepted),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create unique index registration_event_email on public.event_registrations (event_id, lower(email));
create unique index registration_event_team on public.event_registrations (event_id, lower(team_name)) where team_name is not null;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 120),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 5000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'new' check (status in ('new', 'in-progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  entity text not null,
  entity_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create function public.audit_staff_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into activity_log (actor_id, entity, entity_id, action)
  values (auth.uid(), tg_table_name,
    coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id', to_jsonb(new)->>'user_id', to_jsonb(old)->>'user_id'),
    lower(tg_op));
  return coalesce(new, old);
end;
$$;

create function public.protect_last_admin()
returns trigger language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(230010);
  if old.role = 'admin' and old.active and
    (tg_op = 'DELETE' or new.role <> 'admin' or not new.active) and
    not exists (select 1 from staff_profiles where user_id <> old.user_id and role = 'admin' and active)
  then
    raise exception 'The last active administrator cannot be removed';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger protect_last_admin before update or delete on public.staff_profiles
for each row execute function public.protect_last_admin();

alter table public.staff_profiles enable row level security;
alter table public.events enable row level security;
alter table public.members enable row level security;
alter table public.gallery_media enable row level security;
alter table public.event_registrations enable row level security;
alter table public.contact_messages enable row level security;
alter table public.activity_log enable row level security;

create policy staff_read on public.staff_profiles for select to authenticated
using (user_id = auth.uid() or public.is_staff());
create policy admin_manage_staff on public.staff_profiles for all to authenticated
using (public.is_staff('admin')) with check (public.is_staff('admin'));
create policy public_events on public.events for select to anon, authenticated
using (status = 'published');
create policy staff_events on public.events for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy public_members on public.members for select to anon, authenticated using (visible);
create policy staff_members on public.members for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy public_gallery on public.gallery_media for select to anon, authenticated
using (visible and (event_id is null or exists (select 1 from public.events where id = event_id and status = 'published')));
create policy staff_gallery on public.gallery_media for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy staff_registrations_read on public.event_registrations for select to authenticated using (public.is_staff());
create policy staff_registrations_update on public.event_registrations for update to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy staff_contacts_read on public.contact_messages for select to authenticated using (public.is_staff());
create policy staff_contacts_update on public.contact_messages for update to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy staff_activity on public.activity_log for select to authenticated using (public.is_staff());

-- The original records remain intact, but the retired anonymous submission path closes.
drop policy "Anyone can submit a pending registration" on public.team_registrations;
create policy staff_legacy_read on public.team_registrations for select to authenticated using (public.is_staff());
create policy staff_legacy_update on public.team_registrations for update to authenticated
using (public.is_staff()) with check (public.is_staff());

do $$
declare table_name text;
begin
  foreach table_name in array array['staff_profiles', 'events', 'members', 'gallery_media', 'event_registrations', 'contact_messages', 'team_registrations'] loop
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.audit_staff_change()', table_name);
  end loop;
end;
$$;

create function public.submit_contact(payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare address text := lower(trim(payload->>'email'));
begin
  if address is null or address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid email' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext(address));
  if (select count(*) from contact_messages where email = address and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many submissions' using errcode = 'P0001';
  end if;
  insert into contact_messages (name, email, subject, message, locale)
  values (trim(payload->>'name'), address, trim(payload->>'subject'), trim(payload->>'message'), payload->>'locale');
end;
$$;

create function public.submit_event_registration(payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  target events;
  participant jsonb;
  roster jsonb := payload->'players';
  required_count integer;
  main_count integer := 0;
  sub_count integer := 0;
  seen text[] := array[]::text[];
  handle text;
  address text := lower(trim(payload->>'email'));
begin
  select * into target from events where id = (payload->>'event_id')::uuid for share;
  if target.id is null or target.status <> 'published' or not target.registration_enabled or
    target.starts_at <= now() or target.registration_opens_at > now() or target.registration_closes_at <= now() then
    raise exception 'Registration closed' using errcode = 'P0002';
  end if;
  if address is null or address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or
    jsonb_typeof(roster) is distinct from 'array' then
    raise exception 'Invalid registration' using errcode = '22023';
  end if;
  required_count := case when target.entry_type = 'individual' then 1 else target.player_count end;
  if jsonb_array_length(roster) < required_count or jsonb_array_length(roster) > required_count + target.substitute_count then
    raise exception 'Invalid roster size' using errcode = '22023';
  end if;
  for participant in select value from jsonb_array_elements(roster) loop
    handle := lower(trim(participant->>'handle'));
    if participant->>'name' is null or char_length(trim(participant->>'name')) not between 2 and 80 or
      handle is null or char_length(handle) not between 2 and 80 or handle = any(seen) then
      raise exception 'Invalid player' using errcode = '22023';
    end if;
    if target.game = 'valorant' and
      (handle !~ '^[^#]{3,16}#[a-z0-9]{3,5}$' or
       participant->>'rank' is null or participant->>'rank' not in ('iron','bronze','silver','gold','platinum','diamond','ascendant','immortal','radiant')) then
      raise exception 'Invalid Valorant player' using errcode = '22023';
    end if;
    seen := array_append(seen, handle);
    if (participant->>'sub')::boolean then
      sub_count := sub_count + 1;
    else
      main_count := main_count + 1;
    end if;
  end loop;
  if main_count <> required_count or sub_count > target.substitute_count or
    (target.entry_type = 'team' and coalesce(char_length(trim(payload->>'team_name')), 0) not between 2 and 80) then
    raise exception 'Invalid roster' using errcode = '22023';
  end if;
  insert into event_registrations (event_id, name, email, discord, team_name, players, rules_accepted, locale)
  values (target.id, trim(payload->>'name'), address, trim(payload->>'discord'),
    case when target.entry_type = 'team' then trim(payload->>'team_name') else null end,
    roster, (payload->>'rules_accepted')::boolean, payload->>'locale');
end;
$$;

revoke all on function public.submit_contact(jsonb) from public;
revoke all on function public.submit_event_registration(jsonb) from public;
grant execute on function public.submit_contact(jsonb) to anon, authenticated;
grant execute on function public.submit_event_registration(jsonb) to anon, authenticated;
revoke all on function public.audit_staff_change() from public;
revoke all on function public.protect_last_admin() from public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-media', 'club-media', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy staff_media on storage.objects for all to authenticated
using (bucket_id = 'club-media' and public.is_staff())
with check (bucket_id = 'club-media' and public.is_staff());
create policy published_media on storage.objects for select to anon, authenticated
using (bucket_id = 'club-media' and (
  exists (select 1 from public.members where image_path = storage.objects.name and visible) or
  exists (select 1 from public.gallery_media where image_path = storage.objects.name and visible and
    (event_id is null or exists (select 1 from public.events where id = event_id and status = 'published')))
));

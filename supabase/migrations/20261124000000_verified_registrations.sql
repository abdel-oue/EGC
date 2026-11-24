-- Email-verified event registrations with an optional school-address restriction.
--
-- The landing server emails a 6-digit code derived from a secret it shares with the database
-- (HMAC-SHA256 of "email:event_id:10-minute slot"). The database recomputes it, so a direct RPC
-- call cannot skip verification. One-time setup, with the same value as REGISTRATION_CODE_SECRET:
--   select vault.create_secret('<secret>', 'registration_code_secret');

alter table public.events add column allow_any_email boolean not null default false;
-- Events created before this migration keep accepting any address.
update public.events set allow_any_email = true;

alter table public.event_registrations
  add column phone text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  alter column discord drop not null;

-- Code sends and failed attempts, for rate limiting. No policies: only the functions below use it.
create table public.registration_code_log (
  id bigint generated always as identity primary key,
  email text not null,
  kind text not null check (kind in ('sent', 'failed')),
  created_at timestamptz not null default now()
);
create index registration_code_log_email on public.registration_code_log (email, kind, created_at);
alter table public.registration_code_log enable row level security;

create function public.registration_code(address text, target_event uuid, slot bigint)
returns text language sql stable security definer set search_path = public, extensions as $$
  select lpad((('x' || substr(encode(hmac(
    address || ':' || target_event::text || ':' || slot::text,
    (select decrypted_secret from vault.decrypted_secrets where name = 'registration_code_secret'),
    'sha256'), 'hex'), 1, 8))::bit(32)::bigint % 1000000)::text, 6, '0');
$$;
-- Never callable by visitors: it would reveal the code.
revoke all on function public.registration_code(text, uuid, bigint) from public, anon, authenticated;

create function public.registration_email_allowed(target events, address text)
returns boolean language sql immutable set search_path = public as $$
  select address ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and
    (target.allow_any_email or address like '%@esisa.ac.ma');
$$;

create function public.registration_is_open(target events)
returns boolean language sql stable set search_path = public as $$
  select target.id is not null and target.status = 'published' and target.registration_enabled and
    target.starts_at > now() and coalesce(target.registration_opens_at <= now(), true) and
    coalesce(target.registration_closes_at > now(), true);
$$;

-- Called by the landing server before it sends a code. Calling it directly only spends the quota.
create function public.request_registration_code(target_event uuid, address text)
returns void language plpgsql security definer set search_path = public as $$
declare target events;
begin
  address := lower(trim(address));
  select * into target from events where id = target_event;
  if not registration_is_open(target) then
    raise exception 'Registration closed' using errcode = 'P0002';
  end if;
  if not registration_email_allowed(target, address) then
    raise exception 'Email not allowed' using errcode = 'P0003';
  end if;
  if exists (select 1 from event_registrations where event_id = target.id and lower(email) = address) then
    raise exception 'Already registered' using errcode = '23505';
  end if;
  perform pg_advisory_xact_lock(hashtext(address));
  if (select count(*) from registration_code_log
      where email = address and kind = 'sent' and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many codes' using errcode = 'P0001';
  end if;
  insert into registration_code_log (email, kind) values (address, 'sent');
end;
$$;

drop function public.submit_event_registration(jsonb);

-- Returns null on success, 'code' for a wrong code, 'locked' after 2 wrong codes in 20 minutes.
-- Wrong codes return instead of raising so the failed attempt stays recorded.
create function public.submit_event_registration(payload jsonb)
returns text language plpgsql security definer set search_path = public as $$
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
  slot bigint := floor(extract(epoch from now()) / 600)::bigint;
begin
  select * into target from events where id = (payload->>'event_id')::uuid for share;
  if not registration_is_open(target) then
    raise exception 'Registration closed' using errcode = 'P0002';
  end if;
  if address is null or not registration_email_allowed(target, address) then
    raise exception 'Email not allowed' using errcode = 'P0003';
  end if;

  perform pg_advisory_xact_lock(hashtext(address));
  if (select count(*) from registration_code_log
      where email = address and kind = 'failed' and created_at > now() - interval '20 minutes') >= 2 then
    return 'locked';
  end if;
  -- A code stays valid for its 10-minute slot and the next one.
  if coalesce(payload->>'code', '') not in (
    registration_code(address, target.id, slot), registration_code(address, target.id, slot - 1)) then
    insert into registration_code_log (email, kind) values (address, 'failed');
    return 'code';
  end if;

  if coalesce(payload->>'phone', '') !~ '^\+[1-9][0-9]{7,14}$' or
    (target.entry_type = 'team' and coalesce(char_length(trim(payload->>'discord')), 0) not between 2 and 80) then
    raise exception 'Invalid registration' using errcode = '22023';
  end if;

  -- Solo events outside Valorant only need the registrant: their name is their entry.
  if target.entry_type = 'individual' and target.game is distinct from 'valorant' then
    roster := jsonb_build_array(jsonb_build_object('name', trim(payload->>'name'), 'handle', trim(payload->>'name'), 'sub', false));
  end if;
  if jsonb_typeof(roster) is distinct from 'array' then
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

  insert into event_registrations (event_id, name, email, phone, discord, team_name, players, rules_accepted, locale)
  values (target.id, trim(payload->>'name'), address, payload->>'phone',
    case when target.entry_type = 'team' then trim(payload->>'discord') else null end,
    case when target.entry_type = 'team' then trim(payload->>'team_name') else null end,
    roster, (payload->>'rules_accepted')::boolean, payload->>'locale');
  return null;
end;
$$;

revoke all on function public.request_registration_code(uuid, text) from public;
revoke all on function public.submit_event_registration(jsonb) from public;
grant execute on function public.request_registration_code(uuid, text) to anon, authenticated;
grant execute on function public.submit_event_registration(jsonb) to anon, authenticated;

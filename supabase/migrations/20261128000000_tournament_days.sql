-- Tournament days: a second day (e.g. the final Saturday) with its own check-in, a payment
-- deadline for paying entries, a waiting list once an event is full, and match scores / forfeits.

alter table public.events
  add column second_day_at timestamptz,
  add column payment_deadline timestamptz,
  add constraint events_second_day_after_start check (second_day_at is null or second_day_at > starts_at);

alter table public.event_registrations
  add column checked_in_day2_at timestamptz,
  drop constraint event_registrations_status_check,
  add constraint event_registrations_status_check
    check (status in ('pending', 'approved', 'rejected', 'waitlisted'));

-- score: free text such as "2-1" or "TAB 4-3"; forfeit: the loser did not show up.
alter table public.event_matches
  add column score text check (char_length(score) <= 20),
  add column forfeit boolean not null default false;

-- Waiting-list entries do not take a place.
create or replace function public.registration_count(target events)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::integer from event_registrations
  where event_id = target.id and status in ('pending', 'approved');
$$;

-- A full event keeps accepting codes: new entries join the waiting list.
create or replace function public.request_registration_code(target_event uuid, address text)
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


-- Returns null on success, 'waitlisted' when the event is full (the entry joins the waiting list),
-- 'code' for a wrong code, 'locked' after 2 wrong codes in 20 minutes.
-- Wrong codes return instead of raising so the failed attempt stays recorded.
create or replace function public.submit_event_registration(payload jsonb)
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
  is_full boolean;
begin
  select * into target from events where id = (payload->>'event_id')::uuid for update;
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

  -- The event row is locked above, so concurrent submissions cannot both take the last place.
  is_full := registration_full(target);

  insert into event_registrations (event_id, name, email, phone, school, discord, team_name, players, rules_accepted, locale, status)
  values (target.id, trim(payload->>'name'), address, payload->>'phone', nullif(trim(payload->>'school'), ''),
    case when target.entry_type = 'team' then trim(payload->>'discord') else null end,
    case when target.entry_type = 'team' then trim(payload->>'team_name') else null end,
    roster, (payload->>'rules_accepted')::boolean, payload->>'locale',
    case when is_full then 'waitlisted' else 'pending' end);
  return case when is_full then 'waitlisted' end;
end;
$$;

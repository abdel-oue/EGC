-- Optional staff-assigned seed; empty entries are seeded by their players' average rank.
alter table public.event_registrations
  add column seed integer check (seed between 1 and 256);

-- Same public view as before, plus each player's rank and the staff seed. Still no contact details.
drop function public.event_participants(uuid);
create function public.event_participants(target_event uuid)
returns table (id uuid, team_name text, players text[], roster jsonb, seed integer)
language sql stable security definer
set search_path = public as $$
  select registration.id, registration.team_name,
    array(select player->>'handle' from jsonb_array_elements(registration.players) player),
    coalesce((select jsonb_agg(jsonb_build_object(
      'handle', player->>'handle',
      'rank', player->>'rank',
      'sub', coalesce((player->>'sub')::boolean, false)
    )) from jsonb_array_elements(registration.players) player), '[]'::jsonb),
    registration.seed
  from event_registrations registration
  join events on events.id = registration.event_id
  where registration.event_id = target_event and registration.status = 'approved' and events.status = 'published'
  order by registration.created_at;
$$;
revoke all on function public.event_participants(uuid) from public;
grant execute on function public.event_participants(uuid) to anon, authenticated;

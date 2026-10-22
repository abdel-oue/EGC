-- Team registrations for club tournaments (Valorant first).
-- Visitors can only INSERT a pending registration. Nobody can read them with the public key:
-- the committee reviews them in the Supabase dashboard.

create table public.team_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  game text not null check (game in ('valorant')),
  team_name text not null check (char_length(team_name) between 2 and 40),
  team_tag text not null check (team_tag ~ '^[A-Z0-9]{2,5}$'),
  captain_name text not null check (char_length(captain_name) between 2 and 60),
  captain_email text not null check (char_length(captain_email) <= 120),
  captain_phone text not null check (char_length(captain_phone) <= 20),
  captain_discord text not null check (char_length(captain_discord) <= 37),
  players jsonb not null check (jsonb_typeof(players) = 'array' and jsonb_array_length(players) between 5 and 6),
  rules_accepted boolean not null check (rules_accepted),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- One registration per team name per game (case-insensitive).
create unique index team_registrations_game_team_name on public.team_registrations (game, lower(team_name));

alter table public.team_registrations enable row level security;

create policy "Anyone can submit a pending registration"
  on public.team_registrations
  for insert
  to anon
  with check (status = 'pending');

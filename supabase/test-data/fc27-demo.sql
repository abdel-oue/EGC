-- Demo data to check the FC 27 features end to end. Run in the Supabase SQL editor
-- (after the 20261127 and 20261128 migrations). Remove everything with fc27-demo-cleanup.sql.
--
-- Creates three PUBLISHED events whose slugs start with "test-fc27-" (visible on the site until cleanup):
--
-- A. test-fc27-inscriptions: full event (64 places taken: 40 approved + 24 to review),
--    3 on the waiting list, 2 rejected; every 3rd player comes from another school, half of them
--    paid; payment deadline already passed; players 1-20 checked in on day 1; second day set.
--    Check: site card "Complet · liste d'attente ouverte", event page "64 / 64" and two dates,
--    the register page offers the waiting list; admin: filters, "En retard" badges, waiting-list
--    rank, bulk actions, CSV, copy, day 1 / day 2 check-in.
--
-- B. test-fc27-tableau: 8 players, bracket with scores, a forfeit, the 3rd-place match decided
--    and the final still to play. Check: admin "Tableau et résultats" (round names, score and
--    forfeit fields), public bracket tab; day-2 check-in lists only players still in (4).
--
-- C. test-fc27-tirage: 64 approved players and no bracket. Check: admin "Tirage au sort" →
--    "Lancer le tirage au sort", then "Ouvrir l'écran du tirage" (32 matches, Space / →).

begin;

insert into events (id, slug, game, title_fr, title_en, description_fr, rules_fr, starts_at, second_day_at, location,
  status, registration_enabled, allow_any_email, max_registrations, registration_closes_at, payment_deadline,
  entry_type, player_count, substitute_count)
values
  ('7e570000-0000-0000-0000-00000000000a', 'test-fc27-inscriptions', 'fc', 'TEST · Tournoi FC 27 (inscriptions)', 'TEST · FC 27 (registrations)',
   'Événement de test : 64 places prises, liste d''attente ouverte.',
   E'# Format\n1v1, élimination directe, 64 joueurs.\n# Égalité\nBut en or.\nFinale : prolongations puis tirs au but.',
   '2026-12-12 09:15+01', '2026-12-19 10:00+01', 'Salle de conférence · ESISA, Fès',
   'published', true, true, 64, '2026-12-10 23:59+01', now() - interval '1 day', 'individual', 1, 0),
  ('7e570000-0000-0000-0000-00000000000b', 'test-fc27-tableau', 'fc', 'TEST · Tournoi FC 27 (tableau)', 'TEST · FC 27 (bracket)',
   'Événement de test : tableau à 8 joueurs avec scores, forfait et match pour la 3e place.', '',
   '2026-12-05 09:15+01', '2026-12-06 10:00+01', 'Salle de conférence · ESISA, Fès',
   'published', false, true, 8, null, null, 'individual', 1, 0),
  ('7e570000-0000-0000-0000-00000000000c', 'test-fc27-tirage', 'fc', 'TEST · Tournoi FC 27 (tirage)', 'TEST · FC 27 (draw)',
   'Événement de test : 64 joueurs approuvés, prêt pour le tirage au sort.', '',
   '2026-12-13 09:15+01', null, 'Salle de conférence · ESISA, Fès',
   'published', false, true, 64, null, null, 'individual', 1, 0);

-- A: 64 taking a place, 3 waiting, 2 rejected.
insert into event_registrations (event_id, name, email, phone, school, players, rules_accepted, locale, status, paid, checked_in_at, created_at)
select '7e570000-0000-0000-0000-00000000000a', name, email, phone, school,
  jsonb_build_array(jsonb_build_object('name', name, 'handle', name, 'sub', false)), true, 'fr',
  case when i <= 40 then 'approved' when i <= 64 then 'pending' when i <= 67 then 'waitlisted' else 'rejected' end,
  external and i % 2 = 0,
  case when i <= 20 then now() end,
  now() - (70 - i) * interval '1 hour'
from (
  select i, i % 3 = 0 as external,
    format('Joueur %s', lpad(i::text, 2, '0')) as name,
    case when i % 3 = 0 then format('joueur%s@gmail.com', i) else format('joueur%s@esisa.ac.ma', i) end as email,
    '+2126' || lpad((10000000 + i)::text, 8, '0') as phone,
    case when i % 3 = 0 then (array['EMSI Fès', 'ENSA Fès', 'UPF', 'UEMF'])[1 + i % 4] else 'ESISA' end as school
  from generate_series(1, 69) as i
) as players;

-- B: 8 approved players (seeds s1-s8) with day-1 check-in; s1 also checked in on day 2.
insert into event_registrations (id, event_id, name, email, phone, school, players, rules_accepted, locale, status, paid, checked_in_at, checked_in_day2_at)
select format('7e570000-0000-0000-0001-%s', lpad(i::text, 12, '0'))::uuid, '7e570000-0000-0000-0000-00000000000b',
  name, format('tableau%s@esisa.ac.ma', i), '+2127' || lpad((20000000 + i)::text, 8, '0'), 'ESISA',
  jsonb_build_array(jsonb_build_object('name', name, 'handle', name, 'sub', false)), true, 'fr', 'approved', false,
  now() - interval '1 day', case when i = 1 then now() end
from (select i, (array['Sami', 'Nora', 'Yassine', 'Imane', 'Omar', 'Salma', 'Mehdi', 'Hiba'])[i] as name
  from generate_series(1, 8) as i) as players;

-- Standard 8-slot draw: s1-s8, s4-s5, s2-s7, s3-s6. s5 wins by forfeit; the final is still to play.
insert into event_matches (event_id, round, position, team_a, team_b, winner, score, forfeit)
select '7e570000-0000-0000-0000-00000000000b', round, position,
  format('7e570000-0000-0000-0001-%s', lpad(a::text, 12, '0'))::uuid,
  format('7e570000-0000-0000-0001-%s', lpad(b::text, 12, '0'))::uuid,
  case when w is null then null else format('7e570000-0000-0000-0001-%s', lpad(w::text, 12, '0'))::uuid end,
  score, forfeit
from (values
  (1, 0, 1, 8, 1, '3-0', false),
  (1, 1, 4, 5, 5, null, true),
  (1, 2, 2, 7, 2, 'TAB 5-4', false),
  (1, 3, 3, 6, 3, '2-1', false),
  (2, 0, 1, 5, 1, '2-1', false),
  (2, 1, 2, 3, 3, '1-0', false),
  (3, 0, 1, 3, null, null, false),
  (3, 1, 5, 2, 2, '2-0', false)
) as matches (round, position, a, b, w, score, forfeit);

-- C: 64 approved players, a third from other schools (all paid).
insert into event_registrations (event_id, name, email, phone, school, players, rules_accepted, locale, status, paid)
select '7e570000-0000-0000-0000-00000000000c', name,
  case when i % 3 = 0 then format('tirage%s@gmail.com', i) else format('tirage%s@esisa.ac.ma', i) end,
  '+2125' || lpad((30000000 + i)::text, 8, '0'),
  case when i % 3 = 0 then 'ENSA Fès' else 'ESISA' end,
  jsonb_build_array(jsonb_build_object('name', name, 'handle', name, 'sub', false)), true, 'fr', 'approved', i % 3 = 0
from (select i, format('Tireur %s', lpad(i::text, 2, '0')) as name from generate_series(1, 64) as i) as players;

commit;

-- Quick check: expected A 64 taken / 3 waitlisted, B 8, C 64.
select e.slug, registration_count(e) as taken,
  (select count(*) from event_registrations r where r.event_id = e.id and r.status = 'waitlisted') as waitlisted,
  (select count(*) from event_matches m where m.event_id = e.id) as matches
from events e where e.slug like 'test-fc27-%' order by e.slug;

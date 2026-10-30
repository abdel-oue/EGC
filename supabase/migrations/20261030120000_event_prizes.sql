-- Prize per final place, one line each: first line for the winner, second for the runner-up, and so on.
alter table public.events
  add column prizes text not null default '';

-- Removes everything created by fc27-demo.sql (events whose slug starts with "test-fc27-").
begin;

delete from event_registrations
where event_id in (select id from events where slug like 'test-fc27-%');

-- Matches are deleted with their event (on delete cascade).
delete from events where slug like 'test-fc27-%';

commit;

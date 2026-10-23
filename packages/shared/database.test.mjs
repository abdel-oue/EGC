import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Real PostgreSQL execution with minimal Supabase-owned auth/storage scaffolding.
test("migrations, submission functions, permissions, media visibility and audit history", async () => {
  const db = new PGlite();

  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create schema storage;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema public, auth, storage to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);

    for (const name of ["20261022000000_team_registrations.sql", "20261023000000_club_apps.sql"]) {
      await db.exec(await readFile(new URL(`../../supabase/migrations/${name}`, import.meta.url), "utf8"));

      if (name === "20261022000000_team_registrations.sql") {
        await db.exec(`
          insert into team_registrations (game,team_name,team_tag,captain_name,captain_email,captain_phone,captain_discord,players,rules_accepted)
          values ('valorant','Original Team','EGC','Original Captain','legacy@example.com','0612345678','captain',
            '[{"name":"One"},{"name":"Two"},{"name":"Three"},{"name":"Four"},{"name":"Five"}]',true);
        `);
      }
    }

    assert.equal((await db.query("select team_name from team_registrations")).rows[0].team_name, "Original Team");

    await db.exec(`
      grant all on all tables in schema public to anon, authenticated;
      grant all on all sequences in schema public to anon, authenticated;
      grant all on storage.objects to anon, authenticated;
      insert into auth.users values
        ('00000000-0000-0000-0000-000000000001'),
        ('00000000-0000-0000-0000-000000000002'),
        ('00000000-0000-0000-0000-000000000003');
      insert into staff_profiles (user_id, email, role) values
        ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin'),
        ('00000000-0000-0000-0000-000000000002', 'manager@example.com', 'manager');
      insert into events (id, slug, title_fr, starts_at, status, registration_enabled, game, entry_type, player_count)
      values ('10000000-0000-0000-0000-000000000001', 'duo', 'Tournoi duo', now() + interval '1 day', 'published', true, 'valorant', 'team', 2);
      insert into events (slug, title_fr, starts_at) values ('draft', 'Brouillon', now() + interval '2 days');
      insert into members (id, name, role_fr, image_path, visible) values
        ('visible', 'Visible Member', 'Président', 'visible.jpeg', true),
        ('hidden', 'Hidden Member', 'Secrétaire', 'hidden.jpeg', false);
      insert into storage.objects (bucket_id, name) values
        ('club-media', 'visible.jpeg'), ('club-media', 'hidden.jpeg'), ('club-media', 'unpublished.png');
      set role anon;
    `);

    assert.equal((await db.query("select * from events")).rows.length, 1);
    assert.equal((await db.query("select * from members")).rows.length, 1);
    assert.equal((await db.query("select * from contact_messages")).rows.length, 0);
    assert.equal((await db.query("select * from team_registrations")).rows.length, 0);
    assert.equal((await db.query("select * from activity_log")).rows.length, 0);
    assert.deepEqual((await db.query("select name from storage.objects")).rows, [{ name: "visible.jpeg" }]);
    await assert.rejects(db.query("insert into storage.objects (bucket_id,name) values ('club-media','bad.png')"));
    await assert.rejects(db.query("insert into staff_profiles (user_id,email,role) values ('00000000-0000-0000-0000-000000000003','bad@example.com','admin')"));

    const message = { name: "Club Member", email: "member@example.com", subject: "Contact", message: "Hello to the club", locale: "fr" };
    await db.query("select submit_contact($1::jsonb)", [JSON.stringify(message)]);
    assert.equal((await db.query("select * from contact_messages")).rows.length, 0);

    const registration = {
      event_id: "10000000-0000-0000-0000-000000000001", name: "Captain", email: "captain@example.com",
      discord: "captain", team_name: "Duo", locale: "fr", rules_accepted: true,
      players: [
        { name: "Player One", handle: "Player1#EGC", rank: "gold", sub: false },
        { name: "Player Two", handle: "Player2#EGC", rank: "gold", sub: false },
      ],
    };
    await db.query("select submit_event_registration($1::jsonb)", [JSON.stringify(registration)]);
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify(registration)]), { code: "23505" });
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify({ ...registration, players: [] })]), { code: "22023" });
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify({ ...registration, email: "another@example.com", players: [registration.players[0], registration.players[0]] })]), { code: "22023" });
    assert.equal((await db.query("select * from event_registrations")).rows.length, 0);

    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';");
    assert.equal((await db.query("select * from contact_messages")).rows.length, 1);
    assert.equal((await db.query("select * from event_registrations")).rows.length, 1);
    assert.equal((await db.query("select * from events")).rows.length, 2);
    assert.equal((await db.query("select * from team_registrations")).rows.length, 1);
    await db.exec("update event_registrations set status = 'approved'; update contact_messages set status = 'resolved';");
    assert.equal((await db.query("update staff_profiles set role = 'admin' where role = 'manager' returning *")).rows.length, 0);
    assert.equal((await db.query("select * from activity_log where actor_id = '00000000-0000-0000-0000-000000000002'")).rows.length, 2);

    await db.exec("set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';");
    await assert.rejects(db.exec("update staff_profiles set active = false where role = 'admin'"));
    await db.exec("update staff_profiles set active = false where role = 'manager';");
    await db.exec("set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';");
    assert.equal((await db.query("select * from contact_messages")).rows.length, 0);
    assert.equal((await db.query("select * from event_registrations")).rows.length, 0);
    assert.equal((await db.query("select * from activity_log")).rows.length, 0);

    await db.exec("reset role; update events set registration_enabled = false where slug = 'duo'; set role anon;");
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify(registration)]), { code: "P0002" });

    for (let index = 0; index < 4; index += 1) {
      await db.query("select submit_contact($1::jsonb)", [JSON.stringify(message)]);
    }

    await assert.rejects(db.query("select submit_contact($1::jsonb)", [JSON.stringify(message)]), { code: "P0001" });
  } finally {
    await db.close();
  }
});

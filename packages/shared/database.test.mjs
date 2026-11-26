import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { codeSlot, registrationCode } from "../../apps/landing/lib/email-code.js";

const code = (email, eventId) => registrationCode("test-secret", email, eventId, codeSlot());

// Real PostgreSQL execution with minimal Supabase-owned auth/storage scaffolding.
test("migrations, submission functions, permissions, media visibility and audit history", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });

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
      create schema extensions;
      create extension pgcrypto schema extensions;
      create schema vault;
      create table vault.decrypted_secrets (name text, decrypted_secret text);
      insert into vault.decrypted_secrets values ('registration_code_secret', 'test-secret');
    `);

    for (const name of ["20261022000000_team_registrations.sql", "20261023000000_club_apps.sql", "20261025000000_event_rules_brackets.sql", "20261030000000_event_seeds.sql", "20261030120000_event_prizes.sql", "20261103000000_forms.sql", "20261124000000_verified_registrations.sql", "20261127000000_event_hub.sql"]) {
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
      insert into events (id, slug, title_fr, starts_at, status, registration_enabled, game, entry_type, player_count, allow_any_email)
      values ('10000000-0000-0000-0000-000000000001', 'duo', 'Tournoi duo', now() + interval '1 day', 'published', true, 'valorant', 'team', 2, true),
        ('10000000-0000-0000-0000-000000000002', 'fc-solo', 'Tournoi FC', now() + interval '1 day', 'published', true, 'fc', 'individual', 1, false);
      insert into events (slug, title_fr, starts_at) values ('draft', 'Brouillon', now() + interval '2 days');
      insert into members (id, name, role_fr, image_path, visible) values
        ('visible', 'Visible Member', 'Président', 'visible.jpeg', true),
        ('hidden', 'Hidden Member', 'Secrétaire', 'hidden.jpeg', false);
      insert into storage.objects (bucket_id, name) values
        ('club-media', 'visible.jpeg'), ('club-media', 'hidden.jpeg'), ('club-media', 'unpublished.png');
      set role anon;
    `);

    assert.equal((await db.query("select * from events")).rows.length, 2);
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
      code: await code("captain@example.com", "10000000-0000-0000-0000-000000000001"), phone: "+212612345678",
      discord: "captain", team_name: "Duo", locale: "fr", rules_accepted: true,
      players: [
        { name: "Player One", handle: "Player1#EGC", rank: "gold", sub: false },
        { name: "Player Two", handle: "Player2#EGC", rank: "gold", sub: false },
      ],
    };
    await db.query("select submit_event_registration($1::jsonb)", [JSON.stringify(registration)]);
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify(registration)]), { code: "23505" });
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify({ ...registration, players: [] })]), { code: "22023" });
    const another = { ...registration, email: "another@example.com", code: await code("another@example.com", registration.event_id) };
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify({ ...another, players: [registration.players[0], registration.players[0]] })]), { code: "22023" });
    await assert.rejects(db.query("select submit_event_registration($1::jsonb)", [JSON.stringify({ ...another, phone: "0612" })]), { code: "22023" });
    assert.equal((await db.query("select * from event_registrations")).rows.length, 0);

    // Codes: never readable by visitors, wrong guesses are counted, then the address is locked.
    await assert.rejects(db.query("select registration_code('a@b.c', '10000000-0000-0000-0000-000000000001', 1)"));
    const submitRegistration = async (payload) => (await db.query("select submit_event_registration($1::jsonb) as outcome", [JSON.stringify(payload)])).rows[0].outcome;
    const wrong = { ...another, code: another.code === "000000" ? "000001" : "000000" };
    for (let index = 0; index < 2; index += 1) {
      assert.equal(await submitRegistration(wrong), "code");
    }
    assert.equal(await submitRegistration(another), "locked");

    // Solo FC: school addresses only, the registrant becomes the single entry.
    const solo = {
      event_id: "10000000-0000-0000-0000-000000000002", name: "Sami Fc", email: "sami@esisa.ac.ma",
      code: await code("sami@esisa.ac.ma", "10000000-0000-0000-0000-000000000002"), phone: "+212712345678",
      locale: "fr", rules_accepted: true, players: [], school: "ESISA",
    };
    const requestCode = (address) => db.query("select request_registration_code($1, $2)", [solo.event_id, address]);
    await assert.rejects(requestCode("sami@gmail.com"), { code: "P0003" });
    await assert.rejects(submitRegistration({ ...solo, email: "sami@gmail.com" }), { code: "P0003" });
    for (let index = 0; index < 3; index += 1) {
      await requestCode("sami@esisa.ac.ma");
    }
    await assert.rejects(requestCode("sami@esisa.ac.ma"), { code: "P0001" });
    assert.equal(await submitRegistration(solo), null);
    await assert.rejects(requestCode("sami@esisa.ac.ma"), { code: "23505" });

    // Capacity: visitors see the taken places; a full event refuses codes and submissions.
    const places = async () => (await db.query("select registration_count(events) as taken, registration_full(events) as full from events where slug = 'fc-solo'")).rows[0];
    assert.deepEqual(await places(), { taken: 1, full: false });
    await db.exec("reset role;");
    assert.deepEqual((await db.query("select school, paid, checked_in_at from event_registrations where email = 'sami@esisa.ac.ma'")).rows,
      [{ school: "ESISA", paid: false, checked_in_at: null }]);
    await db.exec("set role anon;");
    await db.exec("reset role; update events set max_registrations = 2 where slug = 'fc-solo'; set role anon;");
    const second = { ...solo, name: "Nora Fc", email: "nora@esisa.ac.ma", code: await code("nora@esisa.ac.ma", solo.event_id) };
    await requestCode(second.email);
    assert.equal(await submitRegistration(second), null);
    assert.deepEqual(await places(), { taken: 2, full: true });
    const third = { ...solo, name: "Omar Fc", email: "omar@esisa.ac.ma", code: await code("omar@esisa.ac.ma", solo.event_id) };
    await assert.rejects(requestCode(third.email), { code: "P0004" });
    await assert.rejects(submitRegistration(third), { code: "P0004" });
    // A rejected registration frees its place.
    await db.exec("reset role; update event_registrations set status = 'rejected' where email = 'nora@esisa.ac.ma'; set role anon;");
    assert.deepEqual(await places(), { taken: 1, full: false });
    await db.exec("reset role; delete from event_registrations where email = 'nora@esisa.ac.ma'; update events set max_registrations = null; set role anon;");

    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';");
    assert.equal((await db.query("select * from contact_messages")).rows.length, 1);
    assert.equal((await db.query("select * from event_registrations")).rows.length, 2);
    assert.deepEqual((await db.query("select phone, discord, players from event_registrations where email = 'sami@esisa.ac.ma'")).rows,
      [{ phone: "+212712345678", discord: null, players: [{ name: "Sami Fc", handle: "Sami Fc", sub: false }] }]);
    assert.equal((await db.query("select * from registration_code_log")).rows.length, 0);
    assert.equal((await db.query("select * from events")).rows.length, 3);
    assert.equal((await db.query("select * from team_registrations")).rows.length, 1);
    await db.exec("update event_registrations set status = 'approved'; update contact_messages set status = 'resolved';");
    assert.equal((await db.query("update staff_profiles set role = 'admin' where role = 'manager' returning *")).rows.length, 0);
    assert.equal((await db.query("select * from activity_log where actor_id = '00000000-0000-0000-0000-000000000002'")).rows.length, 3);

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

    const participants = (await db.query("select * from event_participants('10000000-0000-0000-0000-000000000001')")).rows;
    assert.deepEqual(participants.map(({ team_name, players }) => ({ team_name, players })),
      [{ team_name: "Duo", players: ["Player1#EGC", "Player2#EGC"] }]);
    assert.deepEqual(participants[0].roster[1], { handle: "Player2#EGC", rank: "gold", sub: false });
    assert.equal(participants[0].seed, null);
    assert.ok(!("email" in participants[0]));
    await assert.rejects(db.query("insert into event_matches (event_id, round, position) values ('10000000-0000-0000-0000-000000000001', 1, 0)"));

    // The seeded form closes on a fixed date; reopen it so this test does not expire.
    await db.exec("reset role; update forms set closes_at = null; set role anon;");
    const [form] = (await db.query("select * from forms")).rows;
    assert.equal(form.slug, "representant-fifa-k-otaku-2026");
    const answers = {
      name: "Player One", whatsapp: "+212612345678", availability: "tbc", edition: "EA SPORTS FC 26",
      platform: "ps5", level: "Division 3", motivation: "Pour le club", consent: true, injected: "dropped",
    };
    const submit = (changes) => db.query("select submit_form($1::jsonb)", [JSON.stringify({ form_id: form.id, locale: "fr", answers: { ...answers, ...changes } })]);
    await submit({});
    await assert.rejects(submit({}), { code: "23505" });
    await assert.rejects(submit({ whatsapp: "0612345678" }), { code: "22023" });
    await assert.rejects(submit({ whatsapp: "+212612345679", platform: "switch" }), { code: "22023" });
    await assert.rejects(submit({ whatsapp: "+212612345679", motivation: " " }), { code: "22023" });
    await assert.rejects(submit({ whatsapp: "+212612345679", consent: false }), { code: "22023" });
    await assert.rejects(submit({ whatsapp: "+212612345679", name: "x".repeat(201) }), { code: "22023" });
    assert.equal((await db.query("select * from form_responses")).rows.length, 0);

    await db.exec("reset role; update forms set closes_at = now() - interval '1 minute'; set role anon;");
    await assert.rejects(submit({ whatsapp: "+212612345679" }), { code: "P0002" });
    await db.exec("reset role; update forms set closes_at = null, status = 'archived'; set role anon;");
    assert.equal((await db.query("select * from forms")).rows.length, 0);
    await assert.rejects(submit({ whatsapp: "+212612345679" }), { code: "P0002" });

    await db.exec("reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';");
    const responses = (await db.query("select * from form_responses")).rows;
    assert.equal(responses.length, 1);
    assert.equal(responses[0].contact, "+212612345678");
    assert.ok(!("injected" in responses[0].answers));
    assert.equal((await db.query("update form_responses set status = 'approved' returning id")).rows.length, 1);
  } finally {
    await db.close();
  }
});

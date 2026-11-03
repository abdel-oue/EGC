-- A form is one row: submit_form validates answers against the same `fields` the site renders.
-- Field: { name, type: text|textarea|phone|choice|consent, required, label_fr, label_en, hint_fr?, hint_en?, options?: [{ value, label_fr, label_en }] }
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_fr text not null check (char_length(title_fr) between 2 and 150),
  title_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  success_fr text not null,
  success_en text not null default '',
  fields jsonb not null check (jsonb_typeof(fields) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id),
  contact text,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create unique index form_response_contact on public.form_responses (form_id, contact);

alter table public.forms enable row level security;
alter table public.form_responses enable row level security;

create policy public_forms on public.forms for select to anon, authenticated
using (status = 'published');
create policy staff_forms on public.forms for all to authenticated
using (public.is_staff()) with check (public.is_staff());
create policy staff_responses_read on public.form_responses for select to authenticated using (public.is_staff());
create policy staff_responses_update on public.form_responses for update to authenticated
using (public.is_staff()) with check (public.is_staff());

create trigger audit_change after insert or update or delete on public.forms
for each row execute function public.audit_staff_change();
create trigger audit_change after insert or update or delete on public.form_responses
for each row execute function public.audit_staff_change();

create function public.submit_form(payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  target forms;
  field jsonb;
  answer text;
  kind text;
  clean jsonb := '{}';
  phone text;
begin
  select * into target from forms where id = (payload->>'form_id')::uuid;
  if target.id is null or target.status <> 'published' or target.closes_at <= now() then
    raise exception 'Form closed' using errcode = 'P0002';
  end if;
  if jsonb_typeof(payload->'answers') is distinct from 'object' then
    raise exception 'Invalid answers' using errcode = '22023';
  end if;
  for field in select value from jsonb_array_elements(target.fields) loop
    kind := field->>'type';
    answer := trim(payload->'answers'->>(field->>'name'));
    if coalesce(answer, '') = '' or (kind = 'consent' and answer = 'false') then
      if (field->>'required')::boolean then
        raise exception 'Missing answer' using errcode = '22023';
      end if;
      continue;
    end if;
    if (kind = 'text' and char_length(answer) > 200) or
      (kind = 'textarea' and char_length(answer) > 5000) or
      (kind = 'phone' and answer !~ '^\+[1-9][0-9]{7,14}$') or
      (kind = 'consent' and answer <> 'true') or
      (kind = 'choice' and not exists (
        select 1 from jsonb_array_elements(field->'options') option where option->>'value' = answer
      )) then
      raise exception 'Invalid answer' using errcode = '22023';
    end if;
    if kind = 'phone' then
      phone := coalesce(phone, answer);
    end if;
    clean := clean || jsonb_build_object(field->>'name', case when kind = 'consent' then to_jsonb(true) else to_jsonb(answer) end);
  end loop;
  insert into form_responses (form_id, contact, answers, locale)
  values (target.id, phone, clean, case when payload->>'locale' = 'en' then 'en' else 'fr' end);
end;
$$;

revoke all on function public.submit_form(jsonb) from public;
grant execute on function public.submit_form(jsonb) to anon, authenticated;

insert into public.forms (slug, title_fr, title_en, description_fr, description_en, success_fr, success_en, status, closes_at, fields)
values (
  'representant-fifa-k-otaku-2026',
  'Représente EGC sur FIFA — K-Otaku Gaming Expo',
  'Represent EGC on FIFA — K-Otaku Gaming Expo',
  'EGC recherche son représentant FIFA pour participer au K-Otaku Gaming Expo le 21 novembre 2026. Tu veux porter les couleurs du club ? Remplis ce formulaire pour nous présenter ton profil. Nous te recontacterons pour la suite de la sélection. L’envoi du formulaire ne garantit pas ta sélection.',
  'EGC is looking for its FIFA representative at the K-Otaku Gaming Expo on 21 November 2026. Want to wear the club’s colors? Fill in this form to introduce yourself. We will get back to you about the next steps of the selection. Submitting this form does not guarantee your selection.',
  'Merci pour ta candidature ! EGC te recontactera pour la suite de la sélection. Reste disponible sur le contact que tu as indiqué.',
  'Thanks for applying! EGC will get back to you about the next steps of the selection. Stay reachable on the contact you provided.',
  'published',
  '2026-11-21T00:00:00+01:00',
  $json$[
    { "name": "name", "type": "text", "required": true,
      "label_fr": "Nom et prénom", "label_en": "Full name" },
    { "name": "whatsapp", "type": "phone", "required": true,
      "label_fr": "Numéro WhatsApp", "label_en": "WhatsApp number",
      "hint_fr": "Inclure l’indicatif du pays, ex. +212 6 12 34 56 78.", "hint_en": "Include the country code, e.g. +212 6 12 34 56 78." },
    { "name": "school", "type": "text", "required": false,
      "label_fr": "Établissement et année d’études, le cas échéant", "label_en": "School and year of study, if applicable" },
    { "name": "availability", "type": "choice", "required": true,
      "label_fr": "Seras-tu disponible pour participer à l’événement le 21 novembre 2026 ?", "label_en": "Will you be available to take part in the event on 21 November 2026?",
      "options": [
        { "value": "yes", "label_fr": "Oui", "label_en": "Yes" },
        { "value": "no", "label_fr": "Non", "label_en": "No" },
        { "value": "tbc", "label_fr": "À confirmer", "label_en": "To be confirmed" }
      ] },
    { "name": "edition", "type": "text", "required": true,
      "label_fr": "À quelle édition de FIFA / EA SPORTS FC joues-tu actuellement ?", "label_en": "Which edition of FIFA / EA SPORTS FC do you currently play?" },
    { "name": "platform", "type": "choice", "required": true,
      "label_fr": "Sur quelle plateforme joues-tu ?", "label_en": "Which platform do you play on?",
      "options": [
        { "value": "ps5", "label_fr": "PS5", "label_en": "PS5" },
        { "value": "ps4", "label_fr": "PS4", "label_en": "PS4" },
        { "value": "xbox-series", "label_fr": "Xbox Series X|S", "label_en": "Xbox Series X|S" },
        { "value": "xbox-one", "label_fr": "Xbox One", "label_en": "Xbox One" },
        { "value": "pc", "label_fr": "PC", "label_en": "PC" },
        { "value": "other", "label_fr": "Autre", "label_en": "Other" }
      ] },
    { "name": "level", "type": "textarea", "required": true,
      "label_fr": "Quel est ton niveau actuel ?", "label_en": "What is your current level?",
      "hint_fr": "Précise ton mode de jeu, ta division et, si applicable, ton résultat habituel en FUT Champions sur l’édition indiquée.",
      "hint_en": "Specify your game mode, your division and, if applicable, your usual FUT Champions result on the edition you mentioned." },
    { "name": "tournaments", "type": "textarea", "required": false,
      "label_fr": "As-tu déjà participé à des tournois ?", "label_en": "Have you already taken part in tournaments?",
      "hint_fr": "Indique les compétitions et tes résultats.", "hint_en": "List the competitions and your results." },
    { "name": "motivation", "type": "textarea", "required": true,
      "label_fr": "Pourquoi souhaites-tu représenter EGC ?", "label_en": "Why do you want to represent EGC?" },
    { "name": "consent", "type": "consent", "required": true,
      "label_fr": "J’accepte qu’EGC utilise les informations de ce formulaire pour me contacter et gérer ma candidature à cet événement.",
      "label_en": "I agree that EGC may use the information in this form to contact me and manage my application for this event." }
  ]$json$::jsonb
);

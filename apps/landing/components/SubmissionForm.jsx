"use client";

import { startTransition, useActionState, useState } from "react";
import { needsRoster, ranks, schoolDomain } from "@egc/shared/validation.js";

const autoComplete = { email: "email", name: "name", phone: "tel" };

function InputField({ name, label, state, labels, type = "text", minLength, maxLength, required = true, hint, ...rest }) {
  const error = state.errors?.[name];
  const invalid = Boolean(error);

  return (
    <label className="block">
      <span className="mb-2 block font-bold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        autoComplete={autoComplete[name] || "off"}
        {...rest}
      />
      {hint && !invalid && <span className="mt-2 block text-sm text-night/70">{hint}</span>}
      {invalid && <span id={`${name}-error`} className="mt-2 block text-sm text-accent">{error === "domain" ? labels.domain : labels.invalid}</span>}
    </label>
  );
}

// ESISA or another school; the school's name is asked only for "other".
function SchoolField({ state, labels }) {
  const [school, setSchool] = useState("");
  const invalid = Boolean(state.errors?.school);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold">{labels.school}</span>
        <select name="school" required value={school} onChange={(event) => setSchool(event.target.value)} aria-invalid={invalid}>
          <option value="" disabled>{labels.schoolChoose}</option>
          <option value="esisa">ESISA</option>
          <option value="other">{labels.schoolOther}</option>
        </select>
        <span className="mt-2 block text-sm text-night/70">{labels.schoolHint}</span>
        {invalid && <span className="mt-2 block text-sm text-accent">{labels.invalid}</span>}
      </label>
      {school === "other" && (
        <InputField name="school_other" label={labels.schoolName} state={state} labels={labels} minLength={2} maxLength={120} />
      )}
    </div>
  );
}

// Second step: the details stay in the (hidden) form and are sent again with the code.
function VerifyStep({ state, labels, pending, onEdit }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-display text-2xl font-bold uppercase">{labels.verifyTitle}</h2>
        <p role="status">{labels.codeSent.replace("{email}", state.verify)}</p>
      </div>
      <InputField
        name="code"
        label={labels.code}
        state={state}
        labels={labels}
        inputMode="numeric"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        autoComplete="one-time-code"
        autoFocus
      />
      {state.error && <p role="alert" className="font-bold text-accent">{labels[state.error] || labels.server}</p>}
      <div className="flex flex-wrap gap-4">
        <button type="submit" name="intent" value="confirm" disabled={pending} className="chamfer-sm bg-accent px-7 py-4 font-display font-bold uppercase text-offwhite disabled:opacity-60">
          {pending ? labels.sending : labels.confirm}
        </button>
        <button type="submit" name="intent" value="resend" formNoValidate disabled={pending} className="chamfer-sm border border-accent px-5 py-3 font-display font-bold uppercase text-accent disabled:opacity-60">
          {labels.resendCode}
        </button>
        <button type="button" onClick={onEdit} className="underline">{labels.editDetails}</button>
      </div>
    </div>
  );
}

export default function SubmissionForm({ action, locale, labels, rankLabels, event }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [editing, setEditing] = useState(false);
  const verifying = Boolean(state.verify) && !editing;
  const count = event && needsRoster(event) ? (event.entry_type === "individual" ? 1 : event.player_count) : 0;
  const substitutes = event && needsRoster(event) ? event.substitute_count : 0;

  function submit(event) {
    // Keep entered values when validation or the database returns an error.
    event.preventDefault();
    const form = new FormData(event.currentTarget, event.nativeEvent.submitter);
    setEditing(false);
    startTransition(() => formAction(form));
  }

  if (state.ok) {
    return <p role="status" className="border border-accent bg-panel p-8 font-display text-xl">{labels.success}</p>;
  }

  return (
    <form action={formAction} onSubmit={submit} className="space-y-6 border border-line bg-panel p-6 sm:p-10">
      <input type="hidden" name="locale" value={locale} />
      <div className="hidden" aria-hidden="true">
        <label>
          {labels.website}
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {verifying && <VerifyStep state={state} labels={labels} pending={pending} onEdit={() => setEditing(true)} />}
      <div className={verifying ? "hidden" : "space-y-6"}>
        <InputField name="name" label={labels.name} state={state} labels={labels} minLength={2} maxLength={80} />
        <InputField
          name="email"
          label={labels.email}
          type="email"
          state={state}
          labels={labels}
          maxLength={120}
          hint={event && !event.allow_any_email ? labels.schoolEmail.replace("{domain}", schoolDomain) : undefined}
        />
        {event ? (
          <>
            <InputField name="phone" label={labels.phone} type="tel" state={state} labels={labels} maxLength={20} hint={labels.phoneHint} />
            {event.allow_any_email && <SchoolField state={state} labels={labels} />}
            {event.entry_type === "team" && (
              <>
                <InputField name="discord" label={labels.discord} state={state} labels={labels} minLength={2} maxLength={80} />
                <InputField name="team_name" label={labels.teamName} state={state} labels={labels} minLength={2} maxLength={80} />
              </>
            )}
            {Array.from({ length: count + substitutes }, (_, index) => {
              const optional = index >= count;
              const prefix = `player_${index}_`;

              return (
                <fieldset key={index} className="space-y-4 border border-line p-5">
                  <legend className="px-2 font-display font-bold">
                    {optional ? labels.substitute : labels.player} {optional ? `${index - count + 1} (${labels.optional})` : index + 1}
                  </legend>
                  <InputField name={prefix + "name"} label={labels.name} state={state} labels={labels} required={!optional} minLength={2} maxLength={80} />
                  <InputField name={prefix + "handle"} label={event.game === "valorant" ? labels.riotId : labels.handle} state={state} labels={labels} required={!optional} maxLength={80} />
                  {event.game === "valorant" && (
                    <label className="block">
                      <span className="mb-2 block font-bold">{labels.rank}</span>
                      <select name={prefix + "rank"} required={!optional} aria-invalid={Boolean(state.errors?.[prefix + "rank"])} defaultValue="">
                        <option value="">{labels.choose}</option>
                        {ranks.map((rank) => <option value={rank} key={rank}>{rankLabels[rank]}</option>)}
                      </select>
                      {state.errors?.[prefix + "rank"] && <span className="text-sm text-accent">{labels.invalid}</span>}
                    </label>
                  )}
                </fieldset>
              );
            })}
            <label className="flex items-start gap-3">
              <input name="rules" type="checkbox" required aria-invalid={Boolean(state.errors?.rules)} className="mt-1 size-5 shrink-0" />
              <span>{labels.rules}</span>
            </label>
          </>
        ) : (
          <>
            <InputField name="subject" label={labels.subject} state={state} labels={labels} minLength={3} maxLength={150} />
            <label className="block">
              <span className="mb-2 block font-bold">{labels.message}</span>
              <textarea name="message" rows={7} required minLength={10} maxLength={5000} aria-invalid={Boolean(state.errors?.message)} />
              {state.errors?.message && <span className="text-sm text-accent">{labels.invalid}</span>}
            </label>
          </>
        )}
        <p className="text-sm text-night/70">{labels.privacy}</p>
        {!verifying && state.error && <p role="alert" className="font-bold text-accent">{labels[state.error] || labels.server}</p>}
        {!verifying && (
          <button type="submit" disabled={pending} className="chamfer-sm bg-accent px-7 py-4 font-display font-bold uppercase text-offwhite disabled:opacity-60">
            {pending ? labels.sending : labels.submit}
          </button>
        )}
      </div>
    </form>
  );
}

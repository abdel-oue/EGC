"use client";

import { startTransition, useActionState } from "react";
import { ranks } from "@egc/shared/validation.js";

function InputField({ name, label, state, labels, type = "text", minLength, maxLength, required = true }) {
  const invalid = Boolean(state.errors?.[name]);

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
        autoComplete={name === "email" ? "email" : name === "name" ? "name" : "off"}
      />
      {invalid && <span id={`${name}-error`} className="mt-2 block text-sm text-accent">{labels.invalid}</span>}
    </label>
  );
}

export default function SubmissionForm({ action, locale, labels, rankLabels, event }) {
  const [state, formAction, pending] = useActionState(action, {});
  const count = event ? (event.entry_type === "individual" ? 1 : event.player_count) : 0;

  function submit(event) {
    // Keep entered values when validation or the database returns an error.
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
      <InputField name="name" label={labels.name} state={state} labels={labels} minLength={2} maxLength={80} />
      <InputField name="email" label={labels.email} type="email" state={state} labels={labels} maxLength={120} />
      {event ? (
        <>
          <InputField name="discord" label={labels.discord} state={state} labels={labels} minLength={2} maxLength={80} />
          {event.entry_type === "team" && (
            <InputField name="team_name" label={labels.teamName} state={state} labels={labels} minLength={2} maxLength={80} />
          )}
          {Array.from({ length: count + event.substitute_count }, (_, index) => {
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
      {state.error && <p role="alert" className="font-bold text-accent">{labels[state.error] || labels.server}</p>}
      <button type="submit" disabled={pending} className="chamfer-sm bg-accent px-7 py-4 font-display font-bold uppercase text-offwhite disabled:opacity-60">
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}

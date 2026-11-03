"use client";

import { startTransition, useActionState } from "react";
import { localized } from "@egc/shared/i18n.js";
import { formLimits } from "@egc/shared/validation.js";

function Field({ field, locale, invalid, labels }) {
  const { name, type, required } = field;
  const label = localized(field, "label", locale);
  const hint = localized(field, "hint", locale);
  const describedBy = [hint && `${name}-hint`, invalid && `${name}-error`].filter(Boolean).join(" ") || undefined;
  const heading = (
    <>
      {label}
      {!required && <span className="font-normal text-night/60"> ({labels.optional})</span>}
    </>
  );
  const notes = (
    <>
      {hint && <span id={`${name}-hint`} className="mt-2 block text-sm text-night/70">{hint}</span>}
      {invalid && <span id={`${name}-error`} className="mt-2 block text-sm text-accent">{labels.invalid}</span>}
    </>
  );

  if (type === "consent") {
    return (
      <div>
        <label className="flex items-start gap-3">
          <input name={name} type="checkbox" required={required} aria-invalid={invalid} aria-describedby={describedBy} className="mt-1 size-5 shrink-0" />
          <span>{label}</span>
        </label>
        {notes}
      </div>
    );
  }

  if (type === "choice") {
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="font-bold">{heading}</legend>
        <div className="mt-3 space-y-2">
          {field.options.map((option) => (
            <label key={option.value} className="flex items-center gap-3">
              <input name={name} type="radio" value={option.value} required={required} className="size-5 shrink-0" />
              <span>{localized(option, "label", locale)}</span>
            </label>
          ))}
        </div>
        {notes}
      </fieldset>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block font-bold">{heading}</span>
      {type === "textarea" ? (
        <textarea name={name} rows={5} required={required} maxLength={formLimits.textarea} aria-invalid={invalid} aria-describedby={describedBy} />
      ) : (
        <input
          name={name}
          type={type === "phone" ? "tel" : "text"}
          required={required}
          maxLength={formLimits.text}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete={type === "phone" ? "tel" : name === "name" ? "name" : "off"}
        />
      )}
      {notes}
    </label>
  );
}

export default function DynamicForm({ action, form, locale, labels }) {
  const [state, formAction, pending] = useActionState(action, {});

  function submit(event) {
    // Keep entered values when validation or the database returns an error.
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  if (state.ok) {
    return <p role="status" className="border border-accent bg-panel p-8 font-display text-xl">{localized(form, "success", locale)}</p>;
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
      {form.fields.map((field) => (
        <Field key={field.name} field={field} locale={locale} invalid={Boolean(state.errors?.[field.name])} labels={labels} />
      ))}
      {state.error && <p role="alert" className="font-bold text-accent">{labels[state.error] || labels.server}</p>}
      <button type="submit" disabled={pending} className="chamfer-sm bg-accent px-7 py-4 font-display font-bold uppercase text-offwhite disabled:opacity-60">
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}

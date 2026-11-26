"use client";

import { startTransition, useActionState } from "react";
import Link from "next/link";
import t from "@egc/shared/admin.json";
import { resources } from "@egc/shared/resources.js";
import { dateTimeInput } from "@egc/shared/dates.js";

function Field({ field, record, config, events, state }) {
  const [name, type, required, choices] = field;
  const value = record[name] ?? config.defaults[name] ?? "";
  const invalid = Boolean(state.errors?.[name]);
  const help = t.help[name];

  if (type === "checkbox") {
    return (
      <label className="flex items-start gap-3">
        <input type="checkbox" name={name} defaultChecked={Boolean(value)} className="mt-1 size-5 shrink-0" />
        <span>
          <span className="block font-bold">{t[name]}</span>
          {help && <span className="block text-sm text-graphite/70">{help}</span>}
        </span>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block font-bold">{t[name]}</span>
      {type === "textarea" ? (
        <textarea name={name} defaultValue={value} rows={6} maxLength={10000} required={required} aria-invalid={invalid} />
      ) : type === "select" || type === "event" ? (
        <select name={name} defaultValue={String(value)} required={required} aria-invalid={invalid}>
          {!required && <option value="">—</option>}
          {type === "event" ? events.map((event) => (
            <option key={event.id} value={event.id}>{event.title_fr}</option>
          )) : choices.map((choice) => (
            <option key={choice} value={choice}>{t.options[choice] || choice}</option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type === "slug" ? "text" : type}
          defaultValue={type === "datetime-local" ? dateTimeInput(value) : value}
          required={required}
          maxLength={200}
          step={type === "number" ? 1 : undefined}
          pattern={type === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined}
          aria-invalid={invalid}
        />
      )}
      {help && <span className="mt-2 block text-sm text-graphite/70">{help}</span>}
      {invalid && <span className="mt-2 block text-sm text-accent">{t.error}</span>}
    </label>
  );
}

export default function ContentForm({ resource, record, events, action, backHref }) {
  const config = resources[resource];
  const [state, formAction, pending] = useActionState(action, {});
  const fields = new Map(config.fields.map((field) => [field[0], field]));
  const props = { record, config, events, state };
  // Grouped forms (events) render one section per group; the last group is collapsed.
  const groups = config.groups || [[null, config.fields.map(([name]) => name)]];

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form action={formAction} onSubmit={submit} className="max-w-3xl space-y-6 border border-line bg-panel p-5 sm:p-6">
      {groups.map(([title, names], index) => {
        const content = names.map((name) => <Field key={name} field={fields.get(name)} {...props} />);
        const hasError = names.some((name) => state.errors?.[name]);

        if (!title) {
          return <div key="fields" className="space-y-6">{content}</div>;
        }

        if (config.groups && index === groups.length - 1) {
          return (
            <details key={title} open={hasError} className="border-t border-line pt-6">
              <summary className="cursor-pointer font-display text-lg font-bold uppercase">{t[title]}</summary>
              <div className="mt-6 space-y-6">{content}</div>
            </details>
          );
        }

        return (
          <fieldset key={title} className="space-y-6 border-t border-line pt-6 first:border-t-0 first:pt-0">
            <legend className="mb-2 font-display text-lg font-bold uppercase text-accent">{t[title]}</legend>
            {content}
          </fieldset>
        );
      })}
      {config.image && (
        <label className="block">
          <span className="mb-2 block font-bold">{t.image}</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={resource === "gallery" && !record.id} aria-invalid={Boolean(state.errors?.image)} />
          {record.image_path && <span className="mt-2 block break-all text-sm">{t.image_path} : {record.image_path}</span>}
        </label>
      )}
      {state.error && <p role="alert" className="text-accent">{t[state.error] || t.error}</p>}
      {state.success && <p role="status">{t[state.success]}</p>}
      {state.success && !record.id ? (
        <Link href={state.id && resource === "events" ? `/events/${state.id}` : backHref || `/manage/${resource}`} className="block font-bold underline">
          {resource === "events" ? t.open : t.back}
        </Link>
      ) : (
        <button type="submit" disabled={pending} className="w-full bg-accent px-7 py-3 font-bold text-offwhite disabled:opacity-60 sm:w-auto">
          {pending ? t.pending : record.id ? t.save : t.create}
        </button>
      )}
    </form>
  );
}

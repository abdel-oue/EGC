"use client";

import { startTransition, useActionState } from "react";
import Link from "next/link";
import t from "@egc/shared/admin.json";
import { resources } from "@egc/shared/resources.js";
import { dateTimeInput } from "@egc/shared/dates.js";

export default function ContentForm({ resource, record, events, action }) {
  const config = resources[resource];
  const [state, formAction, pending] = useActionState(action, {});

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form action={formAction} onSubmit={submit} className="max-w-3xl space-y-6 border border-line bg-panel p-6">
      {config.fields.map(([name, type, required, choices]) => {
        const value = record[name] ?? config.defaults[name] ?? "";
        const invalid = Boolean(state.errors?.[name]);

        if (type === "checkbox") {
          return (
            <label key={name} className="flex items-center gap-3">
              <input type="checkbox" name={name} defaultChecked={Boolean(value)} className="size-5" />
              <span>{t[name]}</span>
            </label>
          );
        }

        return (
          <label key={name} className="block">
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
            {invalid && <span className="mt-2 block text-sm text-accent">{t.error}</span>}
          </label>
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
      {state.success ? (
        <Link href={`/manage/${resource}`} className="block font-bold underline">{t.back}</Link>
      ) : (
        <button type="submit" disabled={pending} className="bg-accent px-7 py-3 font-bold text-offwhite disabled:opacity-60">
          {pending ? t.pending : record.id ? t.save : t.create}
        </button>
      )}
    </form>
  );
}

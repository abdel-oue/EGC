"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import t from "@egc/shared/admin.json";
import { eventDate } from "@egc/shared/i18n.js";
import { setRegistrationFlag, updateRegistrations } from "@/lib/actions";
import { isEsisa } from "@/lib/registrations";

const filters = {
  status: (row, value) => row.status === value,
  school: (row, value) => isEsisa(row) === (value === "esisa"),
  payment: (row, value) => (row.paid || isEsisa(row)) === (value === "paid"),
  presence: (row, value) => Boolean(row.checked_in_at) === (value === "present"),
};

function schoolLabel(row) {
  return isEsisa(row) ? t.esisa : `${t.external}${row.school && row.school !== "ESISA" ? ` · ${row.school}` : ""}`;
}

// Neutralize spreadsheet formulas in user-supplied values; plain phone numbers stay as they are.
function csvCell(value) {
  let text = String(value ?? "");

  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^\+?\d+$/.test(text))) {
    text = `'${text}`;
  }

  return `"${text.replaceAll("\"", "\"\"")}"`;
}

function downloadCsv(rows, filename) {
  const header = [t.name, t.email, t.phone, t.school, t.status, t.payment, t.presence, t.created_at, t.team_name, t.players];
  const lines = rows.map((row) => [
    row.name, row.email, row.phone, schoolLabel(row), t.options[row.status],
    isEsisa(row) ? t.freeEntry : row.paid ? t.paid : t.notPaid,
    row.checked_in_at ? t.isPresent : t.isAbsent,
    eventDate(row.created_at), row.team_name,
    (row.players || []).map((player) => player.handle).join(", "),
  ].map(csvCell).join(";"));
  // BOM + semicolons: opens directly in French Excel.
  const blob = new Blob(["﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function Select({ name, value, onChange, options }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold">{t[name]}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">{name === "school" ? t.allSchools : t.all}</option>
        {options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}

export default function RegistrationsPanel({ eventId, slug, rows }) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState({ status: "", school: "", payment: "", presence: "" });
  const [selected, setSelected] = useState(() => new Set());
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((row) =>
    (!needle || [row.name, row.email, row.phone, row.team_name, row.school].some((value) => value?.toLowerCase().includes(needle))) &&
    Object.entries(chosen).every(([name, value]) => !value || filters[name](row, value)));
  const picked = visible.filter((row) => selected.has(row.id));
  const active = rows.filter((row) => row.status !== "rejected");
  const summary = [
    [t.total, active.length],
    [t.options.approved, rows.filter((row) => row.status === "approved").length],
    [t.toReview, rows.filter((row) => row.status === "pending").length],
    [t.esisa, active.filter(isEsisa).length],
    [t.external, active.filter((row) => !isEsisa(row)).length],
    [t.unpaid, active.filter((row) => !isEsisa(row) && !row.paid).length],
    [t.present, active.filter((row) => row.checked_in_at).length],
  ];

  function run(task) {
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      setMessage(result?.error ? { error: true, text: t.error } : null);
    });
  }

  function bulk(status) {
    const ids = picked.map((row) => row.id);
    run(async () => {
      const result = await updateRegistrations(eventId, ids, status);

      if (!result.error) {
        setSelected(new Set());
      }

      return result;
    });
  }

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function copy(key) {
    const values = [...new Set(visible.map((row) => row[key]).filter(Boolean))];

    try {
      await navigator.clipboard.writeText(values.join(key === "email" ? ", " : "\n"));
      setMessage({ text: `${t.copied} (${values.length})` });
    } catch {
      setMessage({ error: true, text: t.error });
    }
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {summary.map(([label, value]) => (
          <div key={label} className="border border-line bg-panel p-3">
            <dt className="text-xs text-graphite/70">{label}</dt>
            <dd className="font-display text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-sm font-bold">{t.filter}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
        <Select name="status" value={chosen.status} onChange={(name, value) => setChosen({ ...chosen, [name]: value })}
          options={["pending", "approved", "rejected"].map((key) => [key, t.options[key]])} />
        <Select name="school" value={chosen.school} onChange={(name, value) => setChosen({ ...chosen, [name]: value })}
          options={[["esisa", t.esisa], ["external", t.external]]} />
        <Select name="payment" value={chosen.payment} onChange={(name, value) => setChosen({ ...chosen, [name]: value })}
          options={[["paid", t.paid], ["unpaid", t.notPaid]]} />
        <Select name="presence" value={chosen.presence} onChange={(name, value) => setChosen({ ...chosen, [name]: value })}
          options={[["present", t.isPresent], ["absent", t.isAbsent]]} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => downloadCsv(visible, `inscriptions-${slug}.csv`)} className="border border-line px-4 py-2">{t.exportCsv}</button>
        <button type="button" onClick={() => copy("email")} className="border border-line px-4 py-2">{t.copyEmails}</button>
        <button type="button" onClick={() => copy("phone")} className="border border-line px-4 py-2">{t.copyPhones}</button>
        <span className="text-sm text-graphite/70">{visible.length} / {rows.length}</span>
      </div>

      {message && <p role={message.error ? "alert" : "status"} className={message.error ? "font-bold text-accent" : ""}>{message.text}</p>}

      <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 border border-line bg-panel p-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="size-5"
            checked={visible.length > 0 && picked.length === visible.length}
            onChange={(event) => setSelected(event.target.checked ? new Set(visible.map((row) => row.id)) : new Set())}
          />
          <span>{picked.length ? t.selected.replace("{n}", picked.length) : t.selectAll}</span>
        </label>
        {picked.length > 0 && (
          <>
            <button type="button" disabled={pending} onClick={() => bulk("approved")} className="bg-accent px-4 py-2 font-bold text-offwhite">{t.approve}</button>
            <button type="button" disabled={pending} onClick={() => bulk("rejected")} className="border border-line px-4 py-2">{t.reject}</button>
            <button type="button" disabled={pending} onClick={() => bulk("pending")} className="border border-line px-4 py-2">{t.setPending}</button>
          </>
        )}
      </div>

      {!visible.length && <p>{t.empty}</p>}
      <ul className="divide-y divide-line border border-line">
        {visible.map((row) => {
          const esisa = isEsisa(row);

          return (
            <li key={row.id} className={`grid gap-3 bg-panel p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center ${row.status === "rejected" ? "opacity-60" : ""}`}>
              <input type="checkbox" className="size-6" checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={row.name} />
              <div className="min-w-0">
                <p className="font-bold">
                  {row.team_name || row.name}
                  <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${esisa ? "bg-night text-offwhite" : "bg-accent/15 text-accent"}`}>
                    {schoolLabel(row)}
                  </span>
                </p>
                {row.team_name && <p className="text-sm">{row.name}</p>}
                <p className="break-all text-sm">
                  {row.email}{row.phone && <> · <a href={`tel:${row.phone}`} className="underline">{row.phone}</a></>}
                </p>
                <p className="text-xs text-graphite/70">
                  {t.options[row.status]} · {eventDate(row.created_at)}
                  {row.checked_in_at && <> · {t.isPresent} {new Date(row.checked_in_at).toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" })}</>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setRegistrationFlag(eventId, row.id, "present", !row.checked_in_at))}
                  aria-pressed={Boolean(row.checked_in_at)}
                  className={`min-h-11 px-4 py-2 font-bold ${row.checked_in_at ? "bg-night text-offwhite" : "border border-line"}`}
                >
                  {row.checked_in_at ? `✓ ${t.isPresent}` : t.markPresent}
                </button>
                {!esisa && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setRegistrationFlag(eventId, row.id, "paid", !row.paid))}
                    aria-pressed={row.paid}
                    className={`min-h-11 px-4 py-2 font-bold ${row.paid ? "bg-night text-offwhite" : "border border-accent text-accent"}`}
                  >
                    {row.paid ? `✓ ${t.paid}` : t.markPaid}
                  </button>
                )}
                <Link href={`/submissions/registrations/${row.id}`} className="min-h-11 px-3 py-2 underline">{t.details}</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

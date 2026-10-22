"use client";

import { startTransition, useActionState } from "react";
import HudButton from "@/components/HudButton";

const inputClass =
  "chamfer-sm w-full border-b-2 border-transparent bg-night/5 px-4 py-3 outline-none transition-colors focus:border-accent focus:bg-white aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50";

// t: dict.register. config: game.registration ({ players, subs, ranks }).
export default function RegistrationForm({ action, lang, t, config, teamsHref }) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.errors ?? {};

  // Submitting through `action` alone makes React reset the form afterwards, which wipes
  // every field (selects included) when the server returns errors. Calling the action
  // ourselves keeps what the user typed. `action={formAction}` stays for no-JS submits.
  const submit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  };
  const message = (key) => errors[key] && t.errors[errors[key]];

  if (state.ok) {
    return (
      <div role="status" className="hud-corners intro mx-auto max-w-2xl bg-night px-8 py-14 text-center text-offwhite">
        <p className="font-display text-5xl text-accent">✓</p>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase">{t.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-offwhite/70">{t.successText}</p>
        <HudButton href={teamsHref} className="mt-8">
          {t.successCta}
        </HudButton>
      </div>
    );
  }

  const field = (name, label, props = {}) => (
    <label className="block">
      <span className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-night/60">{label}</span>
      <input
        name={name}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={inputClass}
        {...props}
      />
      {errors[name] && (
        <span id={`${name}-error`} className="mt-1 block text-sm text-red-700">
          {message(name)}
        </span>
      )}
    </label>
  );

  const slots = Array.from({ length: config.players + config.subs }, (_, i) => i);

  return (
    <form action={formAction} onSubmit={submit} className="mx-auto max-w-4xl space-y-12">
      <input type="hidden" name="lang" value={lang} />
      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {state.error && (
        <p role="alert" className="chamfer-sm border-l-4 border-red-700 bg-red-50 px-5 py-4 font-semibold text-red-800">
          {t.errors[state.error]}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-2xl font-bold uppercase">{t.team}</legend>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          {field("teamName", t.teamName, { required: true, minLength: 2, maxLength: 40, autoComplete: "off" })}
          {field("teamTag", t.teamTag, { required: true, pattern: "[A-Za-z0-9]{2,5}", maxLength: 5, autoComplete: "off", className: `${inputClass} uppercase` })}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 font-display text-2xl font-bold uppercase">{t.captain}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("captainName", t.captainName, { required: true, minLength: 2, maxLength: 60, autoComplete: "name" })}
          {field("captainDiscord", t.captainDiscord, { required: true, minLength: 2, maxLength: 37, autoComplete: "off" })}
          {field("captainEmail", t.captainEmail, { type: "email", required: true, maxLength: 120, autoComplete: "email" })}
          {field("captainPhone", t.captainPhone, { type: "tel", required: true, pattern: "\\+?[0-9 ]{8,20}", autoComplete: "tel" })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-5 font-display text-2xl font-bold uppercase">{t.players}</legend>
        <div className="space-y-4">
          {slots.map((i) => {
            const isSub = i >= config.players;
            return (
              <div key={i} className={`chamfer relative grid gap-4 p-5 pt-14 sm:grid-cols-3 ${isSub ? "bg-night/5" : "bg-night/[0.08]"}`}>
                <p className="absolute left-5 top-4 flex items-center gap-3 font-display text-sm font-bold uppercase tracking-wider">
                  <span className={`chamfer-sm grid size-7 place-items-center text-xs ${isSub ? "bg-graphite" : "bg-accent"} text-offwhite`}>
                    {isSub ? "+" : i + 1}
                  </span>
                  {isSub ? t.sub : `${t.player} ${i + 1}`}
                </p>
                {field(`p${i}name`, t.playerName, { required: !isSub, minLength: 2, maxLength: 60, autoComplete: "off" })}
                {field(`p${i}riot`, t.riotId, { required: !isSub, placeholder: t.riotIdHint, pattern: "[^#]{3,16}#[A-Za-z0-9]{3,5}", autoComplete: "off" })}
                <label className="block">
                  <span className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-night/60">{t.rank}</span>
                  <select
                    name={`p${i}rank`}
                    required={!isSub}
                    defaultValue=""
                    aria-invalid={errors[`p${i}rank`] ? true : undefined}
                    aria-describedby={errors[`p${i}rank`] ? `p${i}rank-error` : undefined}
                    className={inputClass}
                  >
                    <option value="">{t.rankPlaceholder}</option>
                    {config.ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {t.ranks[rank]}
                      </option>
                    ))}
                  </select>
                  {errors[`p${i}rank`] && (
                    <span id={`p${i}rank-error`} className="mt-1 block text-sm text-red-700">
                      {message(`p${i}rank`)}
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="rules"
            required
            aria-invalid={errors.rules ? true : undefined}
            aria-describedby={errors.rules ? "rules-error" : undefined}
            className="mt-1 size-5 shrink-0 accent-accent"
          />
          <span>{t.rules}</span>
        </label>
        {errors.rules && (
          <span id="rules-error" className="mt-1 block text-sm text-red-700">
            {message("rules")}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="chamfer shine inline-flex items-center gap-3 bg-accent px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-offwhite transition-colors hover:bg-night disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}

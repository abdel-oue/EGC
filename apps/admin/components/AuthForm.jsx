"use client";

import { useActionState } from "react";
import t from "@egc/shared/admin.json";

export default function AuthForm({ action, mode, initialError }) {
  const [state, formAction, pending] = useActionState(action, {});
  const title = mode === "reset" ? t.reset : mode === "forgot" ? t.forgot : t.login;

  return (
    <form action={formAction} className="space-y-6">
      <h1 className="font-display text-3xl font-bold uppercase">{title}</h1>
      {mode !== "reset" && (
        <label className="block">
          <span className="mb-2 block font-bold">{t.email}</span>
          <input name="email" type="email" required maxLength={120} autoComplete="email" />
        </label>
      )}
      {mode !== "forgot" && (
        <label className="block">
          <span className="mb-2 block font-bold">{mode === "reset" ? t.newPassword : t.password}</span>
          <input name="password" type="password" required minLength={mode === "reset" ? 12 : 1} maxLength={128} autoComplete={mode === "reset" ? "new-password" : "current-password"} />
        </label>
      )}
      {(state.error || initialError) && <p role="alert" className="text-accent">{t[state.error || initialError] || t.error}</p>}
      {state.success && <p role="status">{t[state.success]}</p>}
      <button disabled={pending} className="bg-accent px-6 py-3 font-bold text-offwhite disabled:opacity-60">
        {pending ? t.pending : mode === "forgot" ? t.sendReset : mode === "reset" ? t.save : t.login}
      </button>
    </form>
  );
}

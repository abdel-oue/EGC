"use client";

import { useActionState } from "react";
import t from "@egc/shared/admin.json";

export default function ActionForm({ action, children, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {children}
      {state.error && <p role="alert" className="font-bold text-accent">{t[state.error] || t.error}</p>}
      {state.success && <p role="status">{t[state.success]}</p>}
      <button type="submit" disabled={pending} className="bg-accent px-6 py-3 font-bold text-offwhite disabled:opacity-60">
        {pending ? t.pending : submitLabel || t.save}
      </button>
    </form>
  );
}

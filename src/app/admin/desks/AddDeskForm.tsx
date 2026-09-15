"use client";

import { useActionState, useRef, useEffect } from "react";
import { addDeskAction } from "@/lib/actions/admin-actions";

export default function AddDeskForm() {
  const [state, formAction, pending] = useActionState(
    addDeskAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 mb-6 bg-paper-raised border border-line rounded-sm p-4"
    >
      <div>
        <label className="block text-xs font-medium text-ink mb-1">
          Desk / designation title
        </label>
        <input
          name="title"
          required
          placeholder="e.g. Section Officer (Admin)"
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm min-w-64 focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add desk"}
      </button>
      {state?.error && (
        <p className="text-sm text-vermillion w-full">{state.error}</p>
      )}
    </form>
  );
}

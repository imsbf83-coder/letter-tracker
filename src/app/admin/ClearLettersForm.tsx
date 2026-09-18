"use client";

import { useActionState } from "react";
import { clearLettersAction } from "@/lib/actions/admin-actions";

export default function ClearLettersForm() {
  const [state, formAction, pending] = useActionState(
    clearLettersAction,
    undefined
  );

  return (
    <form
      action={formAction}
      className="border border-vermillion/40 bg-vermillion/5 rounded-sm p-4 max-w-md space-y-3"
    >
      <label className="block text-sm text-ink">
        Type <span className="font-mono font-bold">DELETE</span> to confirm:
      </label>
      <input
        name="confirmation"
        required
        placeholder="DELETE"
        className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-vermillion"
      />
      {state?.error && (
        <p className="text-sm text-vermillion">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-vermillion text-paper text-sm font-medium rounded-sm px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete all letters & movements"}
      </button>
    </form>
  );
}

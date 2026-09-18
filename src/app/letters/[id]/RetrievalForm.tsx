"use client";

import { useActionState } from "react";
import { requestRetrievalAction } from "@/lib/actions/retrieval-actions";

export default function RetrievalForm({ letterId }: { letterId: string }) {
  const [state, formAction, pending] = useActionState(
    requestRetrievalAction,
    undefined
  );

  return (
    <form
      action={formAction}
      className="border border-dashed border-vermillion/50 rounded-sm p-4 max-w-xl space-y-3"
    >
      <input type="hidden" name="letterId" value={letterId} />
      <p className="text-sm text-ink">
        Closed by mistake, or before the final step was actually done? Ask an
        administrator to reopen it.
      </p>
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Reason (optional)
        </label>
        <textarea
          name="reason"
          rows={2}
          placeholder="Why this needs to be reopened"
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-vermillion"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-vermillion">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-vermillion text-paper text-sm font-medium rounded-sm px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "Requesting…" : "Request retrieval"}
      </button>
    </form>
  );
}

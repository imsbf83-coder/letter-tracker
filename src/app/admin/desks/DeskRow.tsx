"use client";

import { useActionState, useState } from "react";
import {
  updateDeskAction,
  deleteDeskAction,
} from "@/lib/actions/admin-actions";

export default function DeskRow({
  desk,
}: {
  desk: { id: string; title: string; userCount: number };
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateDeskAction,
    undefined
  );

  if (!editing) {
    return (
      <tr className="border-t border-line">
        <td className="px-4 py-3">{desk.title}</td>
        <td className="px-4 py-3 text-ink-soft">{desk.userCount}</td>
        <td className="px-4 py-3 text-right space-x-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-ink underline underline-offset-2"
          >
            Edit
          </button>
          <form action={deleteDeskAction} className="inline">
            <input type="hidden" name="id" value={desk.id} />
            <button className="text-xs text-vermillion underline underline-offset-2">
              Remove
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-line bg-paper-raised/60">
      <td colSpan={3} className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={desk.id} />
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Title
            </label>
            <input
              name="title"
              defaultValue={desk.title}
              required
              className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm min-w-64 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-ink text-paper text-xs font-medium rounded-sm px-3 py-1.5 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-ink-soft underline underline-offset-2"
          >
            {state && !state.error ? "Done" : "Cancel"}
          </button>
          {state?.error && (
            <p className="text-sm text-vermillion w-full">{state.error}</p>
          )}
        </form>
      </td>
    </tr>
  );
}

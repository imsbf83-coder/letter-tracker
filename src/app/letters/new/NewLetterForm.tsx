"use client";

import { useActionState } from "react";
import { createLetterAction } from "@/lib/actions/letter-actions";

export default function NewLetterForm({
  schools,
  desks,
  defaultDeskId,
}: {
  schools: { id: string; name: string }[];
  desks: { id: string; title: string }[];
  defaultDeskId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    createLetterAction,
    undefined
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="bg-paper-raised border border-line rounded-sm p-6 space-y-5 max-w-xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Diary number{" "}
            <span className="text-ink-soft font-normal">
              (your office's receiving no.)
            </span>
          </label>
          <input
            name="diaryNo"
            required
            placeholder="e.g. 1284/2026"
            className="diary-no w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Their letter no.{" "}
            <span className="text-ink-soft font-normal">(if any)</span>
          </label>
          <input
            name="senderLetterNo"
            placeholder="e.g. school's own ref no."
            className="diary-no w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Date received
          </label>
          <input
            name="dateReceived"
            type="date"
            required
            defaultValue={today}
            className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          School
        </label>
        <select
          name="schoolId"
          required
          defaultValue=""
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="" disabled>
            Select a school…
          </option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Received from (name / designation at the school)
        </label>
        <input
          name="receivedFrom"
          placeholder="e.g. Headmistress"
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Subject / matter
        </label>
        <textarea
          name="subject"
          required
          rows={3}
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Mark initially to
        </label>
        <select
          name="initialDeskId"
          required
          defaultValue={defaultDeskId ?? ""}
          className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="" disabled>
            Select a desk…
          </option>
          {desks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-vermillion">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper font-medium rounded-sm px-5 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save letter"}
      </button>
    </form>
  );
}

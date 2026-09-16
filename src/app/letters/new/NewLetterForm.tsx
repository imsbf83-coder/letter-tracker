"use client";

import { useActionState, useState } from "react";
import { createLetterAction } from "@/lib/actions/letter-actions";

export default function NewLetterForm({
  schools,
  desks,
  defaultDeskId,
}: {
  schools: { id: string; name: string; code: string | null }[];
  desks: { id: string; title: string }[];
  defaultDeskId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    createLetterAction,
    undefined
  );
  const [schoolId, setSchoolId] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const codedSchools = schools.filter((s) => s.code);
  const codeValue = codedSchools.some((s) => s.id === schoolId) ? schoolId : "";

  return (
    <form
      action={formAction}
      className="bg-paper-raised border border-line rounded-sm p-6 space-y-5 max-w-xl"
    >
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

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Diary no.{" "}
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
          Letter no. / Ref no.{" "}
          <span className="text-ink-soft font-normal">(if any)</span>
        </label>
        <input
          name="senderLetterNo"
          placeholder="e.g. school's own ref no."
          className="diary-no w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Received from
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-soft mb-1">Code</label>
            <select
              value={codeValue}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">—</option>
              {codedSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1">
              School name
            </label>
            <select
              name="schoolId"
              required
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
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
        </div>
        <p className="text-xs text-ink-soft mt-1">
          Pick either one — the other fills in automatically.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Sent by
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

"use client";

import { useActionState, useRef, useEffect } from "react";
import { importSchoolsAction } from "@/lib/actions/admin-actions";

export default function ImportSchoolsForm() {
  const [state, formAction, pending] = useActionState(
    importSchoolsAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state && "added" in state) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <div className="mb-6 bg-paper-raised border border-line rounded-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium text-ink">
          Import schools from CSV
        </h3>
        <a
          href="/schools-sample.csv"
          download
          className="text-xs text-ink underline underline-offset-2"
        >
          Download sample CSV
        </a>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-3"
      >
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm text-ink-soft file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-line file:bg-white file:text-sm file:text-ink file:cursor-pointer"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>

      <p className="text-xs text-ink-soft mt-2">
        Columns: <code>name</code> (required), <code>code</code> and{" "}
        <code>contact</code> (both optional). Rows with a name that already
        exists, or a code already in use, are skipped rather than
        duplicated.
      </p>

      {state && "error" in state && (
        <p className="text-sm text-vermillion mt-3">{state.error}</p>
      )}

      {state && "added" in state && (
        <div className="mt-3 text-sm">
          <p className="text-ink">
            Added <strong>{state.added}</strong>{" "}
            school{state.added === 1 ? "" : "s"}.
          </p>
          {state.skipped.length > 0 && (
            <details className="mt-1">
              <summary className="text-ink-soft cursor-pointer">
                {state.skipped.length} row
                {state.skipped.length === 1 ? "" : "s"} skipped
              </summary>
              <ul className="mt-1 list-disc list-inside text-ink-soft">
                {state.skipped.map((s, i) => (
                  <li key={i}>
                    {s.row > 0 ? `Row ${s.row}: ` : ""}
                    {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

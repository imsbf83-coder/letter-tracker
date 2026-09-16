"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { bulkForwardAction } from "@/lib/actions/letter-actions";

type LetterRow = {
  id: string;
  diaryNo: string;
  schoolName: string;
  subject: string;
  currentDeskId: string;
  currentDeskTitle: string;
  dateReceived: string;
};

export default function DashboardTable({
  letters,
  desks,
  isAdmin,
}: {
  letters: LetterRow[];
  desks: { id: string; title: string }[];
  isAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    bulkForwardAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  function toggleAll(checked: boolean) {
    const boxes = formRef.current?.querySelectorAll<HTMLInputElement>(
      'input[name="letterIds"]'
    );
    boxes?.forEach((box) => {
      box.checked = checked;
    });
  }

  return (
    <form ref={formRef} action={formAction}>
      <div className="flex flex-wrap items-center gap-3 mb-3 bg-paper-raised border border-line rounded-sm px-4 py-3">
        <span className="text-sm text-ink-soft">
          Select letters below, then:
        </span>
        <select
          name="toDeskId"
          required
          defaultValue=""
          className="border border-line rounded-sm px-3 py-1.5 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="" disabled>
            Mark to…
          </option>
          {desks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-1.5 hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {pending ? "Marking…" : "Mark selected"}
        </button>
        {state?.error && (
          <p className="text-sm text-vermillion w-full">{state.error}</p>
        )}
      </div>

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-2 font-medium">Diary No.</th>
              <th className="px-4 py-2 font-medium">Received from</th>
              <th className="px-4 py-2 font-medium">Subject</th>
              {isAdmin && (
                <th className="px-4 py-2 font-medium">Currently at</th>
              )}
              <th className="px-4 py-2 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {letters.map((letter) => (
              <tr
                key={letter.id}
                className="border-t border-line hover:bg-paper-raised/60"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" name="letterIds" value={letter.id} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/letters/${letter.id}`}
                    className="diary-no text-sm text-ink underline underline-offset-2"
                  >
                    {letter.diaryNo}
                  </Link>
                </td>
                <td className="px-4 py-3">{letter.schoolName}</td>
                <td className="px-4 py-3">{letter.subject}</td>
                {isAdmin && (
                  <td className="px-4 py-3">{letter.currentDeskTitle}</td>
                )}
                <td className="px-4 py-3 text-ink-soft">
                  {letter.dateReceived}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

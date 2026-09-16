"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-ink-soft">
          Check one or more letters, pick where each should go, then submit.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-1.5 hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {pending ? "Marking…" : "Mark selected"}
        </button>
      </div>
      {state?.error && (
        <p className="text-sm text-vermillion mb-3">{state.error}</p>
      )}

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium w-8" />
              <th className="px-4 py-2 font-medium">Mark to</th>
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
                  <input type="checkbox" name="selected" value={letter.id} />
                </td>
                <td className="px-4 py-3">
                  <select
                    name={`desk-${letter.id}`}
                    defaultValue=""
                    className="border border-line rounded-sm px-2 py-1 bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink"
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {desks
                      .filter((d) => d.id !== letter.currentDeskId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title}
                        </option>
                      ))}
                  </select>
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

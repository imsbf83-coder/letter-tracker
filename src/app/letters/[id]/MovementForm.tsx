"use client";

import { useActionState, useState } from "react";
import {
  forwardLetterAction,
  closeLetterAction,
} from "@/lib/actions/letter-actions";

export default function MovementForm({
  letterId,
  currentDeskId,
  desks,
}: {
  letterId: string;
  currentDeskId: string;
  desks: { id: string; title: string }[];
}) {
  const [mode, setMode] = useState<"forward" | "close">("forward");
  const [disposalType, setDisposalType] = useState("");
  const [forwardState, forwardAction, forwardPending] = useActionState(
    forwardLetterAction,
    undefined
  );
  const [closeState, closeAction, closePending] = useActionState(
    closeLetterAction,
    undefined
  );

  const otherDesks = desks.filter((d) => d.id !== currentDeskId);

  return (
    <div className="bg-paper-raised border border-line rounded-sm p-5 max-w-xl">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("forward")}
          className={`text-sm px-3 py-1.5 rounded-sm border ${
            mode === "forward"
              ? "bg-ink text-paper border-ink"
              : "border-line text-ink-soft"
          }`}
        >
          Mark to next desk
        </button>
        <button
          type="button"
          onClick={() => setMode("close")}
          className={`text-sm px-3 py-1.5 rounded-sm border ${
            mode === "close"
              ? "bg-ink text-paper border-ink"
              : "border-line text-ink-soft"
          }`}
        >
          Close / dispose
        </button>
      </div>

      {mode === "forward" ? (
        <form action={forwardAction} className="space-y-4">
          <input type="hidden" name="letterId" value={letterId} />
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Mark to
            </label>
            <select
              name="toDeskId"
              required
              defaultValue=""
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="" disabled>
                Select a desk…
              </option>
              {otherDesks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Outgoing letter no.{" "}
              <span className="text-ink-soft font-normal">
                (only if you're issuing a reply/dispatch at this step)
              </span>
            </label>
            <input
              name="letterNo"
              placeholder="e.g. 456/2026"
              className="diary-no w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Action taken
            </label>
            <textarea
              name="remarks"
              rows={2}
              placeholder="What was done before marking it forward"
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          {forwardState?.error && (
            <p className="text-sm text-vermillion">{forwardState.error}</p>
          )}
          <button
            type="submit"
            disabled={forwardPending}
            className="bg-ink text-paper font-medium rounded-sm px-5 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {forwardPending ? "Marking…" : "Mark forward"}
          </button>
        </form>
      ) : (
        <form action={closeAction} className="space-y-4">
          <input type="hidden" name="letterId" value={letterId} />
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              What happened with this letter?
            </label>
            <select
              name="disposalType"
              required
              value={disposalType}
              onChange={(e) => setDisposalType(e.target.value)}
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="REPLIED">Reply sent back to the school</option>
              <option value="FORWARDED_EXTERNAL">
                Matter forwarded to another department/office
              </option>
              <option value="CLOSED_NO_REPLY">
                Closed after discussion — no reply/forward needed
              </option>
              <option value="ACTION_TAKEN">
                Action taken (describe below)
              </option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Outgoing letter no.{" "}
              <span className="text-ink-soft font-normal">(if any)</span>
            </label>
            <input
              name="letterNo"
              placeholder="e.g. 456/2026"
              className="diary-no w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {(disposalType === "REPLIED" ||
            disposalType === "FORWARDED_EXTERNAL") && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {disposalType === "REPLIED"
                  ? "Sent to (person/office at the school)"
                  : "Sent to (department/office)"}
              </label>
              <input
                name="sentTo"
                placeholder={
                  disposalType === "REPLIED"
                    ? "e.g. Headmistress"
                    : "e.g. name of the department or office"
                }
                className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Action taken
            </label>
            <textarea
              name="remarks"
              rows={2}
              placeholder="What was done to close this letter"
              className="w-full border border-line rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          {closeState?.error && (
            <p className="text-sm text-vermillion">{closeState.error}</p>
          )}
          <button
            type="submit"
            disabled={closePending}
            className="bg-forest text-paper font-medium rounded-sm px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {closePending ? "Closing…" : "Close this letter"}
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useActionState, useRef, useState } from "react";
import { importLettersAction } from "@/lib/actions/import-actions";

export default function ImportForm() {
  const [state, formAction, pending] = useActionState(
    importLettersAction,
    undefined
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (textareaRef.current) {
        textareaRef.current.value = String(reader.result ?? "");
      }
    };
    reader.readAsText(file);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-paper-raised border border-line rounded-sm p-6 space-y-4 max-w-xl"
    >
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          CSV file
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          required
          className="w-full text-sm text-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-line file:bg-white file:text-ink file:text-sm"
        />
        {fileName && (
          <p className="text-xs text-ink-soft mt-1">Selected: {fileName}</p>
        )}
      </div>

      {/* Hidden field carries the actual file content to the server action */}
      <textarea ref={textareaRef} name="csvText" className="hidden" />

      {state?.error && (
        <p className="text-sm text-vermillion">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-forest">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper font-medium rounded-sm px-5 py-2 hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import letters"}
      </button>
    </form>
  );
}

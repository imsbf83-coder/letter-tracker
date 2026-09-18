import { requireSession, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import ImportForm from "./ImportForm";

export default async function ImportLettersPage() {
  const session = await requireSession();
  const deskTitle = await getDeskTitles(session.deskIds);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        Bulk Import Letters
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        Upload a CSV of many letters at once instead of entering them one by
        one. Empty fields are fine — nothing here will block the import.
      </p>

      <a
        href="/letters-import-template.csv"
        download
        className="inline-block mb-6 text-sm text-ink underline underline-offset-2"
      >
        Download a template CSV with the right columns
      </a>

      <ImportForm />

      <div className="mt-8 border border-dashed border-line rounded-sm p-4 text-sm text-ink-soft space-y-2">
        <p className="font-medium text-ink">Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Columns can be named: Date Received, Diary No, Letter No / Ref
            No, Received From, Sent By, Subject — in any order.
          </li>
          <li>Any of these can be left blank for any row.</li>
          <li>
            Every imported letter starts at your own desk. If a school name
            in the file doesn&apos;t match one you already have, it will be
            created automatically — check{" "}
            <span className="font-medium">Admin → Schools</span> afterward
            for typos.
          </li>
          <li>Blank dates default to today.</li>
        </ul>
      </div>
    </AppShell>
  );
}

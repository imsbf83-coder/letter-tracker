import { prisma } from "@/lib/prisma";
import { requireSession, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import NewLetterForm from "./NewLetterForm";

export default async function NewLetterPage() {
  const session = await requireSession();
  const deskTitle = await getDeskTitle(session.deskId);

  const [schools, desks] = await Promise.all([
    prisma.school.findMany({ orderBy: { name: "asc" } }),
    prisma.desk.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        New Letter
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        Record a letter or file as it comes in.
      </p>

      {schools.length === 0 || desks.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-6 text-ink-soft text-sm">
          You need at least one school and one desk set up before logging
          letters. Ask an administrator to add them under{" "}
          <span className="font-medium text-ink">Admin</span>.
        </div>
      ) : (
        <NewLetterForm
          schools={schools.map((s) => ({ id: s.id, name: s.name }))}
          desks={desks.map((d) => ({ id: d.id, title: d.title }))}
          defaultDeskId={session.deskId}
        />
      )}
    </AppShell>
  );
}

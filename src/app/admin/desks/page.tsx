import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import AddDeskForm from "./AddDeskForm";
import DeskRow from "./DeskRow";

export default async function AdminDesksPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitles(session.deskIds);
  const desks = await prisma.desk.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">Desks</h2>
      <p className="text-ink-soft text-sm mb-6">
        Every designation/desk a letter can be marked to (e.g. Section
        Officer, Deputy Director, Director).
      </p>

      <AddDeskForm />

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Users</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {desks.map((d) => (
              <DeskRow
                key={d.id}
                desk={{ id: d.id, title: d.title, userCount: d._count.users }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

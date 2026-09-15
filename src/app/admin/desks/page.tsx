import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import { deleteDeskAction } from "@/lib/actions/admin-actions";
import AddDeskForm from "./AddDeskForm";

export default async function AdminDesksPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitle(session.deskId);
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
              <tr key={d.id} className="border-t border-line">
                <td className="px-4 py-3">{d.title}</td>
                <td className="px-4 py-3 text-ink-soft">{d._count.users}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteDeskAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="text-xs text-vermillion underline underline-offset-2">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

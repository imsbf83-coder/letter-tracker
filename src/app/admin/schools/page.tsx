import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import { deleteSchoolAction } from "@/lib/actions/admin-actions";
import AddSchoolForm from "./AddSchoolForm";

export default async function AdminSchoolsPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitle(session.deskId);
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">Schools</h2>
      <p className="text-ink-soft text-sm mb-6">
        Add every school your office receives letters from. You can paste
        these in one at a time, or ask me to bulk-import a list you provide.
      </p>

      <AddSchoolForm />

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-ink-soft">{s.code ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteSchoolAction}>
                    <input type="hidden" name="id" value={s.id} />
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

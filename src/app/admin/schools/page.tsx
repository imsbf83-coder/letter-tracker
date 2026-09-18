import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import AddSchoolForm from "./AddSchoolForm";
import SchoolRow from "./SchoolRow";

export default async function AdminSchoolsPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitles(session.deskIds);
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
              <SchoolRow key={s.id} school={s} />
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

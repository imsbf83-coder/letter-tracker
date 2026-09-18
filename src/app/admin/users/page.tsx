import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import AddUserForm from "./AddUserForm";
import UserRow from "./UserRow";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitles(session.deskIds);
  const [users, desks] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: { desks: true },
    }),
    prisma.desk.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">Users</h2>
      <p className="text-ink-soft text-sm mb-6">
        Login accounts. A user can hold more than one desk.
      </p>

      <AddUserForm desks={desks.map((d) => ({ id: d.id, title: d.title }))} />

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Username</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Desks</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  username: u.username,
                  role: u.role,
                  deskIds: u.desks.map((d) => d.id),
                  deskTitles: u.desks.map((d) => d.title).join(", "),
                }}
                desks={desks.map((d) => ({ id: d.id, title: d.title }))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import { deleteUserAction } from "@/lib/actions/admin-actions";
import AddUserForm from "./AddUserForm";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitle(session.deskId);
  const [users, desks] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: { desk: true },
    }),
    prisma.desk.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">Users</h2>
      <p className="text-ink-soft text-sm mb-6">
        One login per desk (or an administrator account).
      </p>

      <AddUserForm desks={desks.map((d) => ({ id: d.id, title: d.title }))} />

      <div className="border border-line rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Username</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Desk</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-ink-soft">{u.username}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {u.desk?.title ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={u.id} />
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

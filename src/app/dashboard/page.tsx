import { prisma } from "@/lib/prisma";
import { requireSession, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import DashboardTable from "./DashboardTable";

export default async function DashboardPage() {
  const session = await requireSession();
  const deskTitle = await getDeskTitles(session.deskIds);

  const whereClause =
    session.role === "ADMIN"
      ? { status: "PENDING" as const }
      : {
          status: "PENDING" as const,
          currentDeskId: { in: session.deskIds ?? [] },
        };

  const [pendingAtDesk, pendingTotal, closedTotal, desks] = await Promise.all([
    prisma.letter.findMany({
      where: whereClause,
      include: { school: true, currentDesk: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.letter.count({ where: { status: "PENDING" } }),
    prisma.letter.count({ where: { status: "CLOSED" } }),
    prisma.desk.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        {session.role === "ADMIN" ? "All pending letters" : "At your desk"}
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        {session.role === "ADMIN"
          ? "Every letter currently awaiting action, across all desks."
          : "Letters waiting for action from you."}
      </p>

      <div className="flex gap-4 mb-8">
        <div className="bg-paper-raised border border-line rounded-sm px-4 py-3">
          <p className="text-2xl font-serif font-bold text-vermillion">
            {pendingTotal}
          </p>
          <p className="text-xs text-ink-soft">Pending office-wide</p>
        </div>
        <div className="bg-paper-raised border border-line rounded-sm px-4 py-3">
          <p className="text-2xl font-serif font-bold text-forest">
            {closedTotal}
          </p>
          <p className="text-xs text-ink-soft">Closed to date</p>
        </div>
      </div>

      {pendingAtDesk.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-8 text-center text-ink-soft">
          Nothing waiting here right now.
        </div>
      ) : (
        <DashboardTable
          letters={pendingAtDesk.map((letter) => ({
            id: letter.id,
            diaryNo: letter.diaryNo,
            schoolName: letter.school.name,
            sentBy: letter.receivedFrom,
            subject: letter.subject,
            currentDeskId: letter.currentDeskId,
            currentDeskTitle: letter.currentDesk.title,
            dateReceived: letter.dateReceived.toLocaleDateString(),
          }))}
          desks={desks.map((d) => ({ id: d.id, title: d.title }))}
          isAdmin={session.role === "ADMIN"}
        />
      )}
    </AppShell>
  );
}

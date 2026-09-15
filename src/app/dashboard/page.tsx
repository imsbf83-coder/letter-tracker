import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const session = await requireSession();
  const deskTitle = await getDeskTitle(session.deskId);

  const whereClause =
    session.role === "ADMIN"
      ? { status: "PENDING" as const }
      : { status: "PENDING" as const, currentDeskId: session.deskId ?? "" };

  const [pendingAtDesk, pendingTotal, closedTotal] = await Promise.all([
    prisma.letter.findMany({
      where: whereClause,
      include: { school: true, currentDesk: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.letter.count({ where: { status: "PENDING" } }),
    prisma.letter.count({ where: { status: "CLOSED" } }),
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
        <div className="border border-line rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-medium">Diary No.</th>
                <th className="px-4 py-2 font-medium">School</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                {session.role === "ADMIN" && (
                  <th className="px-4 py-2 font-medium">Currently at</th>
                )}
                <th className="px-4 py-2 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {pendingAtDesk.map((letter) => (
                <tr
                  key={letter.id}
                  className="border-t border-line hover:bg-paper-raised/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/letters/${letter.id}`}
                      className="diary-no text-sm text-ink underline underline-offset-2"
                    >
                      {letter.diaryNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{letter.school.name}</td>
                  <td className="px-4 py-3">{letter.subject}</td>
                  {session.role === "ADMIN" && (
                    <td className="px-4 py-3">{letter.currentDesk.title}</td>
                  )}
                  <td className="px-4 py-3 text-ink-soft">
                    {letter.dateReceived.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

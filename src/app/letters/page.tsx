import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import type { Prisma } from "@prisma/client";

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; schoolId?: string }>;
}) {
  const session = await requireSession();
  const deskTitle = await getDeskTitle(session.deskId);
  const params = await searchParams;

  const [schools] = await Promise.all([
    prisma.school.findMany({ orderBy: { name: "asc" } }),
  ]);

  const where: Prisma.LetterWhereInput = {};
  if (params.status === "PENDING" || params.status === "CLOSED") {
    where.status = params.status;
  }
  if (params.schoolId) {
    where.schoolId = params.schoolId;
  }
  if (params.q) {
    where.OR = [
      { diaryNo: { contains: params.q, mode: "insensitive" } },
      { subject: { contains: params.q, mode: "insensitive" } },
      { receivedFrom: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const letters = await prisma.letter.findMany({
    where,
    include: { school: true, currentDesk: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        All Letters
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        Search and filter every letter in the register.
      </p>

      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search diary no, subject, sender…"
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm min-w-64 focus:outline-none focus:ring-2 focus:ring-ink"
        />
        <select
          name="schoolId"
          defaultValue={params.schoolId ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="">All schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="border border-line rounded-sm px-3 py-2 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        >
          <option value="">Any status</option>
          <option value="PENDING">Pending</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button
          type="submit"
          className="bg-ink text-paper text-sm font-medium rounded-sm px-4 py-2 hover:bg-ink-soft transition-colors"
        >
          Filter
        </button>
      </form>

      {letters.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-8 text-center text-ink-soft">
          No letters match that search.
        </div>
      ) : (
        <div className="border border-line rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-raised text-left text-ink-soft text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-medium">Diary No.</th>
                <th className="px-4 py-2 font-medium">School</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Currently at</th>
                <th className="px-4 py-2 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((letter) => (
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
                    {letter.senderLetterNo && (
                      <p className="diary-no text-xs text-ink-soft mt-0.5">
                        {letter.senderLetterNo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">{letter.school.name}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {letter.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        letter.status === "PENDING"
                          ? "text-vermillion"
                          : "text-forest"
                      }
                    >
                      {letter.status === "PENDING" ? "Pending" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{letter.currentDesk.title}</td>
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

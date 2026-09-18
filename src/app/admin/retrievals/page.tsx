import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getDeskTitles } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import {
  approveRetrievalAction,
  rejectRetrievalAction,
} from "@/lib/actions/retrieval-actions";

export default async function AdminRetrievalsPage() {
  const session = await requireAdmin();
  const deskTitle = await getDeskTitles(session.deskIds);

  const requests = await prisma.retrievalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      letter: { include: { school: true, currentDesk: true } },
      requestedBy: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <h2 className="font-serif text-2xl font-bold text-ink mb-1">
        Retrieval requests
      </h2>
      <p className="text-ink-soft text-sm mb-6">
        Desks asking to reopen a letter they closed. Approving puts it back
        as pending at the same desk.
      </p>

      {requests.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-8 text-center text-ink-soft">
          No pending requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-paper-raised border border-line rounded-sm p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link
                    href={`/letters/${r.letterId}?view=1`}
                    className="diary-no text-sm text-ink underline underline-offset-2"
                  >
                    {r.letter.diaryNo}
                  </Link>
                  <p className="text-sm text-ink mt-0.5">
                    {r.letter.subject}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {r.letter.school.name} — currently at{" "}
                    {r.letter.currentDesk.title}
                  </p>
                </div>
                <span className="text-xs text-ink-soft whitespace-nowrap">
                  {r.createdAt.toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-ink-soft mb-3">
                Requested by <span className="text-ink">{r.requestedBy.name}</span>
                {r.reason && (
                  <>
                    {" — "}
                    <span className="italic">&ldquo;{r.reason}&rdquo;</span>
                  </>
                )}
              </p>

              <div className="flex gap-3">
                <form action={approveRetrievalAction}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <button className="bg-forest text-paper text-sm font-medium rounded-sm px-4 py-1.5 hover:opacity-90 transition-opacity">
                    Approve
                  </button>
                </form>
                <form action={rejectRetrievalAction}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <button className="border border-line text-ink-soft text-sm font-medium rounded-sm px-4 py-1.5 hover:border-ink hover:text-ink transition-colors">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

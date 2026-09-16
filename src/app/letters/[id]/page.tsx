import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession, getDeskTitle } from "@/lib/require-session";
import AppShell from "@/components/AppShell";
import MovementForm from "./MovementForm";

function disposalLabel(type: string) {
  switch (type) {
    case "REPLIED":
      return "Reply sent back to the school";
    case "FORWARDED_EXTERNAL":
      return "Matter forwarded to another department/office";
    case "CLOSED_NO_REPLY":
      return "Closed after discussion — no reply/forward needed";
    default:
      return "Closed";
  }
}

export default async function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const deskTitle = await getDeskTitle(session.deskId);

  const [letter, desks] = await Promise.all([
    prisma.letter.findUnique({
      where: { id },
      include: {
        school: true,
        currentDesk: true,
        initialDesk: true,
        createdBy: true,
        movements: {
          include: { fromDesk: true, toDesk: true, movedBy: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.desk.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!letter) notFound();

  const canAct =
    letter.status === "PENDING" &&
    (session.role === "ADMIN" || session.deskId === letter.currentDeskId);

  return (
    <AppShell session={session} deskTitle={deskTitle}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="diary-no text-sm text-brass mb-1">{letter.diaryNo}</p>
          {letter.senderLetterNo && (
            <p className="diary-no text-xs text-ink-soft mb-1">
              Their letter no.: {letter.senderLetterNo}
            </p>
          )}
          <h2 className="font-serif text-2xl font-bold text-ink">
            {letter.subject}
          </h2>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-sm ${
            letter.status === "PENDING"
              ? "bg-vermillion/10 text-vermillion"
              : "bg-forest/10 text-forest"
          }`}
        >
          {letter.status === "PENDING" ? "Pending" : "Closed"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 bg-paper-raised border border-line rounded-sm p-5 text-sm">
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            School
          </dt>
          <dd className="text-ink">{letter.school.name}</dd>
        </div>
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            Received from
          </dt>
          <dd className="text-ink">{letter.receivedFrom || "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            Date received
          </dt>
          <dd className="text-ink">
            {letter.dateReceived.toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            Logged by
          </dt>
          <dd className="text-ink">{letter.createdBy.name}</dd>
        </div>
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            Initially marked to
          </dt>
          <dd className="text-ink">{letter.initialDesk.title}</dd>
        </div>
        <div>
          <dt className="text-ink-soft text-xs uppercase tracking-wide">
            Currently at
          </dt>
          <dd className="text-ink font-medium">{letter.currentDesk.title}</dd>
        </div>
      </dl>

      <h3 className="font-serif text-lg font-bold text-ink mb-3">
        Movement history
      </h3>

      <ol className="relative border-l border-line ml-2 mb-8">
        <li className="ml-5 pb-6 relative">
          <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-brass" />
          <p className="text-sm text-ink">
            <span className="font-medium">Received</span> — logged by{" "}
            {letter.createdBy.name}, marked to {letter.initialDesk.title}
          </p>
          <p className="text-xs text-ink-soft">
            {letter.createdAt.toLocaleString()}
          </p>
        </li>

        {letter.movements.map((m) => (
          <li key={m.id} className="ml-5 pb-6 relative">
            <span
              className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ${
                m.action === "CLOSE" ? "bg-forest" : "bg-ink-soft"
              }`}
            />
            <p className="text-sm text-ink">
              <span className="font-medium">{m.movedBy.name}</span>{" "}
              {m.action === "CLOSE"
                ? `closed the letter from ${m.fromDesk.title}`
                : `marked it from ${m.fromDesk.title} to ${m.toDesk?.title}`}
            </p>
            {m.disposalType && (
              <p className="text-sm text-forest font-medium mt-0.5">
                {disposalLabel(m.disposalType)}
              </p>
            )}
            {m.letterNo && (
              <p className="diary-no text-sm text-brass mt-0.5">
                Outgoing letter no. {m.letterNo}
              </p>
            )}
            {m.sentTo && (
              <p className="text-sm text-ink mt-0.5">Sent to: {m.sentTo}</p>
            )}
            {m.remarks && (
              <p className="text-sm text-ink-soft mt-0.5">
                <span className="font-medium text-ink">Action taken:</span>{" "}
                {m.remarks}
              </p>
            )}
            <p className="text-xs text-ink-soft">
              {m.createdAt.toLocaleString()}
            </p>
          </li>
        ))}
      </ol>

      {canAct && (
        <MovementForm
          letterId={letter.id}
          currentDeskId={letter.currentDeskId}
          desks={desks.map((d) => ({ id: d.id, title: d.title }))}
        />
      )}

      {!canAct && letter.status === "PENDING" && (
        <p className="text-sm text-ink-soft border border-dashed border-line rounded-sm p-4">
          This letter is at {letter.currentDesk.title}. Only that desk (or an
          administrator) can move it forward.
        </p>
      )}
    </AppShell>
  );
}

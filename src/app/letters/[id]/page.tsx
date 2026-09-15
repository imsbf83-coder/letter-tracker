import { prisma } from "@/lib/prisma";

export default async function LetterDetailPage({ params }: { params: { id: string } }) {
  const letter = await prisma.letter.findUnique({
    where: { id: params.id },
    include: {
      school: true,
      currentDesk: true,
      trails: {
        include: { fromDesk: true, toDesk: true, actionByUser: true },
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!letter) return <div>Letter not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Letter No: {letter.letterNo}</h1>
        <p><strong>Subject:</strong> {letter.subject}</p>
        <p><strong>Current Desk:</strong> {letter.currentDesk.name}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Letter Movement Trail</h2>
        <div className="border-l-2 border-blue-500 pl-4 space-y-4">
          {letter.trails.map((trail) => (
            <div key={trail.id} className="relative">
              <p className="font-semibold text-sm">
                Dispatch / Movement No: {trail.dispatchNo || "N/A"}
              </p>
              <p className="text-sm">
                From: <strong>{trail.fromDesk?.name || "Origin"}</strong> → To: <strong>{trail.toDesk.name}</strong>
              </p>
              <p className="text-xs text-gray-500">
                By: {trail.actionByUser.name} on {new Date(trail.timestamp).toLocaleString()}
              </p>
              {trail.remarks && <p className="text-xs italic mt-1">Remarks: {trail.remarks}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}

// A user can hold more than one desk now, so this returns a
// comma-joined display string (or null if they hold none, e.g. an admin).
export async function getDeskTitles(deskIds: string[]) {
  if (!deskIds || deskIds.length === 0) return null;
  const desks = await prisma.desk.findMany({ where: { id: { in: deskIds } } });
  if (desks.length === 0) return null;
  return desks.map((d) => d.title).join(", ");
}

export function canActOnDesk(
  session: { role: "ADMIN" | "DESK"; deskIds: string[] },
  currentDeskId: string
) {
  return (
    session.role === "ADMIN" || (session.deskIds ?? []).includes(currentDeskId)
  );
}

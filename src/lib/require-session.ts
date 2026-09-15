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

export async function getDeskTitle(deskId: string | null) {
  if (!deskId) return null;
  const desk = await prisma.desk.findUnique({ where: { id: deskId } });
  return desk?.title ?? null;
}

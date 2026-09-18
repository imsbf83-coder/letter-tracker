"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin, canActOnDesk } from "@/lib/require-session";

export type FormState = { error?: string } | undefined;

// A desk user asks to reopen a letter they closed by mistake, or before
// the real final step was actually done. Needs an admin's approval before
// anything on the letter itself changes.
export async function requestRetrievalAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const letterId = String(formData.get("letterId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!letterId) return { error: "Letter not found." };

  const letter = await prisma.letter.findUnique({ where: { id: letterId } });
  if (!letter) return { error: "Letter not found." };
  if (letter.status !== "CLOSED") {
    return { error: "Only a closed letter can be requested back." };
  }
  if (!canActOnDesk(session, letter.currentDeskId)) {
    return { error: "Only the desk that closed this letter can request it back." };
  }

  const existingPending = await prisma.retrievalRequest.findFirst({
    where: { letterId, status: "PENDING" },
  });
  if (existingPending) {
    return { error: "A retrieval request for this letter is already pending." };
  }

  await prisma.retrievalRequest.create({
    data: {
      letterId,
      requestedById: session.userId,
      reason: reason || null,
    },
  });

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/admin/retrievals");
}

export async function approveRetrievalAction(formData: FormData) {
  await requireAdmin();
  const session = await requireSession();

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return;

  const request = await prisma.retrievalRequest.findUnique({
    where: { id: requestId },
    include: { letter: true },
  });
  if (!request || request.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.retrievalRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedById: session.userId,
        decidedAt: new Date(),
      },
    }),
    prisma.letter.update({
      where: { id: request.letterId },
      data: { status: "PENDING", closedAt: null },
    }),
    prisma.movement.create({
      data: {
        letterId: request.letterId,
        fromDeskId: request.letter.currentDeskId,
        toDeskId: null,
        action: "REOPENED",
        remarks: request.reason
          ? `Reopened per retrieval request: ${request.reason}`
          : "Reopened per retrieval request",
        movedById: session.userId,
      },
    }),
  ]);

  revalidatePath(`/letters/${request.letterId}`);
  revalidatePath("/dashboard");
  revalidatePath("/letters");
  revalidatePath("/admin/retrievals");
}

export async function rejectRetrievalAction(formData: FormData) {
  await requireAdmin();
  const session = await requireSession();

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return;

  const request = await prisma.retrievalRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "PENDING") return;

  await prisma.retrievalRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      decidedById: session.userId,
      decidedAt: new Date(),
    },
  });

  revalidatePath(`/letters/${request.letterId}`);
  revalidatePath("/admin/retrievals");
}

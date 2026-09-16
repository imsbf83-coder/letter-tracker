"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import type { SessionPayload } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

function canActOnDesk(session: SessionPayload, currentDeskId: string) {
  return session.role === "ADMIN" || session.deskId === currentDeskId;
}

export async function createLetterAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const diaryNo = String(formData.get("diaryNo") ?? "").trim();
  const senderLetterNo = String(formData.get("senderLetterNo") ?? "").trim();
  const dateReceived = String(formData.get("dateReceived") ?? "");
  const schoolId = String(formData.get("schoolId") ?? "");
  const receivedFrom = String(formData.get("receivedFrom") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const initialDeskId = String(formData.get("initialDeskId") ?? "");

  if (!diaryNo || !dateReceived || !schoolId || !subject || !initialDeskId) {
    return { error: "Please fill in all required fields." };
  }

  const letter = await prisma.letter.create({
    data: {
      diaryNo,
      senderLetterNo: senderLetterNo || null,
      dateReceived: new Date(dateReceived),
      schoolId,
      receivedFrom,
      subject,
      initialDeskId,
      currentDeskId: initialDeskId,
      createdById: session.userId,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/letters");
  redirect(`/letters/${letter.id}`);
}

export async function forwardLetterAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const letterId = String(formData.get("letterId") ?? "");
  const toDeskId = String(formData.get("toDeskId") ?? "");
  const remarks = String(formData.get("remarks") ?? "").trim();
  const letterNo = String(formData.get("letterNo") ?? "").trim();

  if (!letterId || !toDeskId) {
    return { error: "Choose a desk to mark this letter to." };
  }

  const letter = await prisma.letter.findUnique({ where: { id: letterId } });
  if (!letter) return { error: "Letter not found." };
  if (letter.status === "CLOSED") {
    return { error: "This letter is already closed." };
  }
  if (!canActOnDesk(session, letter.currentDeskId)) {
    return { error: "This letter isn't at your desk." };
  }

  await prisma.$transaction([
    prisma.movement.create({
      data: {
        letterId,
        fromDeskId: letter.currentDeskId,
        toDeskId,
        action: "FORWARD",
        letterNo: letterNo || null,
        remarks: remarks || null,
        movedById: session.userId,
      },
    }),
    prisma.letter.update({
      where: { id: letterId },
      data: { currentDeskId: toDeskId },
    }),
  ]);

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/dashboard");
  revalidatePath("/letters");
}

// Forward each checked letter to whatever desk was chosen in its own row,
// from the dashboard's per-row quick action. Silently skips any letter the
// user can't act on or that is already closed, and reports how many moved.
export async function bulkForwardAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const letterIds = formData.getAll("selected").map(String).filter(Boolean);

  if (letterIds.length === 0) {
    return { error: "Select at least one letter." };
  }

  const targets = new Map<string, string>();
  for (const letterId of letterIds) {
    const toDeskId = String(formData.get(`desk-${letterId}`) ?? "");
    if (toDeskId) targets.set(letterId, toDeskId);
  }

  if (targets.size === 0) {
    return { error: "Choose a desk for each selected letter." };
  }

  const letters = await prisma.letter.findMany({
    where: { id: { in: [...targets.keys()] } },
  });

  const actionable = letters.filter(
    (l) => l.status === "PENDING" && canActOnDesk(session, l.currentDeskId)
  );

  if (actionable.length === 0) {
    return { error: "None of the selected letters could be moved." };
  }

  await prisma.$transaction(
    actionable.flatMap((letter) => {
      const toDeskId = targets.get(letter.id)!;
      return [
        prisma.movement.create({
          data: {
            letterId: letter.id,
            fromDeskId: letter.currentDeskId,
            toDeskId,
            action: "FORWARD",
            movedById: session.userId,
          },
        }),
        prisma.letter.update({
          where: { id: letter.id },
          data: { currentDeskId: toDeskId },
        }),
      ];
    })
  );

  revalidatePath("/dashboard");
  revalidatePath("/letters");

  if (actionable.length < letterIds.length) {
    return {
      error: `Moved ${actionable.length} of ${letterIds.length} selected letters — the rest weren't at your desk, already closed, or had no desk chosen.`,
    };
  }
}

export async function closeLetterAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const letterId = String(formData.get("letterId") ?? "");
  const remarks = String(formData.get("remarks") ?? "").trim();
  const letterNo = String(formData.get("letterNo") ?? "").trim();
  const sentTo = String(formData.get("sentTo") ?? "").trim();
  const disposalType = String(formData.get("disposalType") ?? "");

  const validDisposalTypes = [
    "REPLIED",
    "FORWARDED_EXTERNAL",
    "CLOSED_NO_REPLY",
    "ACTION_TAKEN",
    "OTHER",
  ];
  if (!letterId) return { error: "Letter not found." };
  if (!validDisposalTypes.includes(disposalType)) {
    return { error: "Choose what happened with this letter." };
  }

  const letter = await prisma.letter.findUnique({ where: { id: letterId } });
  if (!letter) return { error: "Letter not found." };
  if (letter.status === "CLOSED") {
    return { error: "This letter is already closed." };
  }
  if (!canActOnDesk(session, letter.currentDeskId)) {
    return { error: "This letter isn't at your desk." };
  }

  await prisma.$transaction([
    prisma.movement.create({
      data: {
        letterId,
        fromDeskId: letter.currentDeskId,
        toDeskId: null,
        action: "CLOSE",
        disposalType: disposalType as
          | "REPLIED"
          | "FORWARDED_EXTERNAL"
          | "CLOSED_NO_REPLY"
          | "ACTION_TAKEN"
          | "OTHER",
        letterNo: letterNo || null,
        sentTo: sentTo || null,
        remarks: remarks || null,
        movedById: session.userId,
      },
    }),
    prisma.letter.update({
      where: { id: letterId },
      data: { status: "CLOSED", closedAt: new Date() },
    }),
  ]);

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/dashboard");
  revalidatePath("/letters");
}

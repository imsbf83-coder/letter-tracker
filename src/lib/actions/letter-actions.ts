"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

export type FormState = { error?: string } | undefined;

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

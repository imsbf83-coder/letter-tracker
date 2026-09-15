"use me"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function moveLetter(data: {
  letterId: String;
  toDeskId: String;
  fromDeskId: String;
  dispatchNo: String;
  remarks?: String;
  userId: String;
}) {
  await prisma.$transaction([
    // 1. Create trail entry
    prisma.letterTrail.create({
      data: {
        letterId: data.letterId,
        fromDeskId: data.fromDeskId,
        toDeskId: data.toDeskId,
        actionByUserId: data.userId,
        dispatchNo: data.dispatchNo,
        remarks: data.remarks,
      },
    }),
    // 2. Update letter's current desk location
    prisma.letter.update({
      where: { id: data.letterId },
      data: { currentDeskId: data.toDeskId },
    }),
  ]);

  revalidatePath(`/letters/${data.letterId}`);
}
"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { hashPassword, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string; success?: string } | undefined;

export async function changePasswordAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Fill in all three fields." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation don't match." };
  }
  if (newPassword.length < 4) {
    return { error: "New password is too short." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) return { error: "Account not found." };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: "Password updated." };
}

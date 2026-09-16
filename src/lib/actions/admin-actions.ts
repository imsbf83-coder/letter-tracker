"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-session";
import { hashPassword } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

// ---- Schools ----

export async function addSchoolAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  if (!name) return { error: "School name is required." };

  await prisma.school.create({
    data: { name, code: code || null },
  });
  revalidatePath("/admin/schools");
}

export async function updateSchoolAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  if (!id) return { error: "Missing school id." };
  if (!name) return { error: "School name is required." };

  await prisma.school.update({
    where: { id },
    data: { name, code: code || null },
  });
  revalidatePath("/admin/schools");
}

export async function deleteSchoolAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.school.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/schools");
}

// ---- Desks ----

export async function addDeskAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Desk title is required." };

  const exists = await prisma.desk.findUnique({ where: { title } });
  if (exists) return { error: "A desk with that title already exists." };

  await prisma.desk.create({ data: { title } });
  revalidatePath("/admin/desks");
}

export async function updateDeskAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id) return { error: "Missing desk id." };
  if (!title) return { error: "Desk title is required." };

  const clash = await prisma.desk.findUnique({ where: { title } });
  if (clash && clash.id !== id) {
    return { error: "A desk with that title already exists." };
  }

  await prisma.desk.update({ where: { id }, data: { title } });
  revalidatePath("/admin/desks");
}

export async function deleteDeskAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.desk.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/desks");
}

// ---- Users ----

export async function addUserAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "DESK") as "ADMIN" | "DESK";
  const deskId = String(formData.get("deskId") ?? "") || null;

  if (!name || !username || !password) {
    return { error: "Name, username, and password are all required." };
  }
  if (role === "DESK" && !deskId) {
    return { error: "Choose a desk for this user." };
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { error: "That username is already taken." };

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      username,
      passwordHash,
      role,
      deskId: role === "ADMIN" ? null : deskId,
    },
  });
  revalidatePath("/admin/users");
}

export async function updateUserAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "DESK") as "ADMIN" | "DESK";
  const deskId = String(formData.get("deskId") ?? "") || null;

  if (!id) return { error: "Missing user id." };
  if (!name || !username) {
    return { error: "Name and username are required." };
  }
  if (role === "DESK" && !deskId) {
    return { error: "Choose a desk for this user." };
  }

  const clash = await prisma.user.findUnique({ where: { username } });
  if (clash && clash.id !== id) {
    return { error: "That username is already taken." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      username,
      role,
      deskId: role === "ADMIN" ? null : deskId,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.user.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/users");
}

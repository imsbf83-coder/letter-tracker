"use server";

import Papa from "papaparse";
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

export type ImportSchoolsState =
  | { error: string }
  | { added: number; skipped: { row: number; reason: string }[] }
  | undefined;

export async function importSchoolsAction(
  _prevState: ImportSchoolsState,
  formData: FormData
): Promise<ImportSchoolsState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file first." };
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    return { error: "No rows found in that file." };
  }

  const existing = await prisma.school.findMany();
  const takenNames = new Set(
    existing.map((s) => s.name.trim().toLowerCase())
  );
  const takenCodes = new Set(
    existing
      .filter((s) => s.code)
      .map((s) => s.code!.trim().toLowerCase())
  );

  let added = 0;
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2; // +1 for zero-index, +1 for the header line

    const name = (row.name ?? "").trim();
    const code = (row.code ?? "").trim();
    const contact = (row.contact ?? "").trim();

    if (!name) {
      skipped.push({ row: rowNo, reason: "no name given" });
      continue;
    }
    if (takenNames.has(name.toLowerCase())) {
      skipped.push({ row: rowNo, reason: `"${name}" already exists` });
      continue;
    }
    if (code && takenCodes.has(code.toLowerCase())) {
      skipped.push({ row: rowNo, reason: `code "${code}" already in use` });
      continue;
    }

    await prisma.school.create({
      data: {
        name,
        code: code || null,
        contact: contact || null,
      },
    });

    takenNames.add(name.toLowerCase());
    if (code) takenCodes.add(code.toLowerCase());
    added++;
  }

  revalidatePath("/admin/schools");
  return { added, skipped };
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
  const deskIds = formData.getAll("deskIds").map(String).filter(Boolean);

  if (!name || !username || !password) {
    return { error: "Name, username, and password are all required." };
  }
  if (role === "DESK" && deskIds.length === 0) {
    return { error: "Choose at least one desk for this user." };
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
      desks:
        role === "ADMIN" ? undefined : { connect: deskIds.map((id) => ({ id })) },
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
  const deskIds = formData.getAll("deskIds").map(String).filter(Boolean);

  if (!id) return { error: "Missing user id." };
  if (!name || !username) {
    return { error: "Name and username are required." };
  }
  if (role === "DESK" && deskIds.length === 0) {
    return { error: "Choose at least one desk for this user." };
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
      // "set" replaces every existing desk connection with this exact list,
      // so removing a desk here actually removes it, not just adds new ones.
      desks: { set: role === "ADMIN" ? [] : deskIds.map((id) => ({ id })) },
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

// ---- Danger zone ----

export async function clearLettersAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== "DELETE") {
    return { error: 'Type DELETE (all caps) exactly to confirm.' };
  }

  // Movements reference letters, so clear those first.
  await prisma.movement.deleteMany({});
  await prisma.letter.deleteMany({});

  revalidatePath("/dashboard");
  revalidatePath("/letters");
  revalidatePath("/admin");
}

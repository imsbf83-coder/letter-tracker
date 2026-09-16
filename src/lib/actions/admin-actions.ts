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

// ---- Schools: CSV import ----

// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes ("")
// and commas inside quotes. Good enough for a simple name/code/contact list.
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
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
    return { error: "Choose a CSV file to import." };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { error: "The CSV file is empty." };
  }
  if (!("name" in rows[0])) {
    return {
      error: "The CSV needs a 'name' column in its header row.",
    };
  }

  const existing = await prisma.school.findMany({
    select: { name: true, code: true },
  });
  const seenNames = new Set(existing.map((s) => s.name.trim().toLowerCase()));
  const seenCodes = new Set(
    existing.filter((s) => s.code).map((s) => s.code!.trim().toLowerCase())
  );

  const skipped: { row: number; reason: string }[] = [];
  const toCreate: { name: string; code: string | null; contact: string | null }[] =
    [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // +1 for header, +1 for 1-indexing
    const name = (row["name"] ?? "").trim();
    const code = (row["code"] ?? "").trim();
    const contact = (row["contact"] ?? "").trim();

    if (!name) {
      skipped.push({ row: rowNum, reason: "Missing school name." });
      return;
    }
    if (seenNames.has(name.toLowerCase())) {
      skipped.push({ row: rowNum, reason: `"${name}" already exists.` });
      return;
    }
    if (code && seenCodes.has(code.toLowerCase())) {
      skipped.push({
        row: rowNum,
        reason: `Code "${code}" is already used by another school.`,
      });
      return;
    }

    seenNames.add(name.toLowerCase());
    if (code) seenCodes.add(code.toLowerCase());
    toCreate.push({ name, code: code || null, contact: contact || null });
  });

  let added = 0;
  for (const school of toCreate) {
    try {
      await prisma.school.create({ data: school });
      added++;
    } catch {
      skipped.push({ row: -1, reason: `Could not add "${school.name}".` });
    }
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

  const clash = await prisma.desk.findFirst({ where: { title, NOT: { id } } });
  if (clash) return { error: "A desk with that title already exists." };

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

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.user.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/users");
}

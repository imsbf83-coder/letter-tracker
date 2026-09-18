"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

export type ImportState =
  | { error?: string; success?: string }
  | undefined;

// Accepts several possible header spellings per field, matched loosely
// (lowercased, punctuation/spaces stripped) so small formatting differences
// in the uploaded CSV don't cause a mismatch.
const FIELD_ALIASES: Record<string, string[]> = {
  dateReceived: ["datereceived", "date"],
  diaryNo: ["diaryno", "diarynumber"],
  senderLetterNo: [
    "letterno",
    "refno",
    "letternorefno",
    "senderletterno",
    "theirletterno",
  ],
  school: ["receivedfrom", "school", "schoolname"],
  receivedFromPerson: ["sentby", "receivedfromperson", "contact"],
  subject: ["subject", "matter"],
};

function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildHeaderMap(headers: string[]) {
  const map: Record<string, string> = {}; // fieldKey -> actual header name in file
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    normalized: normalizeHeader(h),
  }));

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const match = normalizedHeaders.find((h) => aliases.includes(h.normalized));
    if (match) map[field] = match.original;
  }
  return map;
}

function parseDate(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date();
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
}

export async function importLettersAction(
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  const session = await requireSession();

  const csvText = String(formData.get("csvText") ?? "");
  if (!csvText.trim()) {
    return { error: "No file content received. Choose a CSV file first." };
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    return { error: "No rows found in that file." };
  }

  const headerMap = buildHeaderMap(Object.keys(rows[0] ?? {}));

  // Preload existing schools/desks so we can match by name, and create
  // fallback/missing ones on the fly without ever failing the import.
  const [existingSchools, existingDesks] = await Promise.all([
    prisma.school.findMany(),
    prisma.desk.findMany(),
  ]);

  const schoolByName = new Map(
    existingSchools.map((s) => [normalizeHeader(s.name), s])
  );
  const deskByName = new Map(
    existingDesks.map((d) => [normalizeHeader(d.title), d])
  );

  let unspecifiedSchool = existingSchools.find(
    (s) => normalizeHeader(s.name) === "unspecified"
  );
  let unspecifiedDesk = existingDesks.find(
    (d) => normalizeHeader(d.title) === "unspecified"
  );

  async function resolveSchool(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      if (!unspecifiedSchool) {
        unspecifiedSchool = await prisma.school.create({
          data: { name: "Unspecified" },
        });
        schoolByName.set("unspecified", unspecifiedSchool);
      }
      return unspecifiedSchool.id;
    }
    const key = normalizeHeader(trimmed);
    const existing = schoolByName.get(key);
    if (existing) return existing.id;

    const created = await prisma.school.create({ data: { name: trimmed } });
    schoolByName.set(key, created);
    return created.id;
  }

  async function resolveDesk(title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      if (!unspecifiedDesk) {
        unspecifiedDesk = await prisma.desk.create({
          data: { title: "Unspecified" },
        });
        deskByName.set("unspecified", unspecifiedDesk);
      }
      return unspecifiedDesk.id;
    }
    const key = normalizeHeader(trimmed);
    const existing = deskByName.get(key);
    if (existing) return existing.id;

    const created = await prisma.desk.create({ data: { title: trimmed } });
    deskByName.set(key, created);
    return created.id;
  }

  let imported = 0;
  let newSchools = 0;
  const schoolCountBefore = schoolByName.size;

  // Every imported letter starts at the importing user's own desk (an admin
  // with no desk of their own falls back to "Unspecified") — the CSV no
  // longer needs a desk column at all.
  const importDeskId = (session.deskIds ?? [])[0] ?? (await resolveDesk(""));

  for (const row of rows) {
    // Every field is optional here on purpose — missing data never blocks
    // the import, it just gets stored blank or under "Unspecified".
    const get = (field: string) =>
      headerMap[field] ? (row[headerMap[field]] ?? "").toString() : "";

    const diaryNo = get("diaryNo").trim();
    const senderLetterNo = get("senderLetterNo").trim();
    const dateReceived = parseDate(get("dateReceived"));
    const receivedFromPerson = get("receivedFromPerson").trim();
    const subject = get("subject").trim();
    const schoolName = get("school").trim();

    const schoolId = await resolveSchool(schoolName);

    await prisma.letter.create({
      data: {
        diaryNo, // may be blank — never blocks the import
        senderLetterNo: senderLetterNo || null,
        dateReceived,
        schoolId,
        receivedFrom: receivedFromPerson,
        subject,
        initialDeskId: importDeskId,
        currentDeskId: importDeskId,
        createdById: session.userId,
        status: "PENDING",
      },
    });
    imported++;
  }

  newSchools = schoolByName.size - schoolCountBefore;

  revalidatePath("/dashboard");
  revalidatePath("/letters");

  let success = `Imported ${imported} letter${imported === 1 ? "" : "s"}.`;
  if (newSchools > 0) {
    success += ` Created ${newSchools} new school(s) from unmatched names — review them under Admin.`;
  }

  return { success };
}

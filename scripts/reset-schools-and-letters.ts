// Deletes ALL Schools and ALL Letters (and their Movement history), while
// leaving Desks and Users completely untouched.
//
// Run with:  npx tsx scripts/reset-schools-and-letters.ts
//
// This targets whatever DATABASE_URL is in your .env — double-check that's
// the database you actually mean to wipe before typing YES.

import { PrismaClient } from "@prisma/client";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const prisma = new PrismaClient();

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toUpperCase() === "YES";
}

async function main() {
  const [movementCount, letterCount, schoolCount] = await Promise.all([
    prisma.movement.count(),
    prisma.letter.count(),
    prisma.school.count(),
  ]);

  console.log("This will permanently delete:");
  console.log(`  ${movementCount} movement/history record(s)`);
  console.log(`  ${letterCount} letter record(s)`);
  console.log(`  ${schoolCount} school record(s)`);
  console.log("Desks and Users will NOT be touched.\n");

  if (movementCount === 0 && letterCount === 0 && schoolCount === 0) {
    console.log("Nothing to delete — all three tables are already empty.");
    return;
  }

  const ok = await confirm('Type "YES" (all caps) to continue, anything else to cancel: ');
  if (!ok) {
    console.log("Cancelled. Nothing was deleted.");
    return;
  }

  // Order matters: Movement references Letter, Letter references School.
  await prisma.$transaction([
    prisma.movement.deleteMany(),
    prisma.letter.deleteMany(),
    prisma.school.deleteMany(),
  ]);

  console.log("\nDone. Schools and letters cleared. Desks and users kept as-is.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

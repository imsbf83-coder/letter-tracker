"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSchool(id: string, data: { name: string; code?: string }) {
  await prisma.school.update({ where: { id }, data });
  revalidatePath("/admin/schools");
}

export async function updateDesk(id: string, data: { name: string; code?: string }) {
  await prisma.desk.update({ where: { id }, data });
  revalidatePath("/admin/desks");
}

export async function updateUser(id: string, data: { name: string; email: string; role: string }) {
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/users");
}
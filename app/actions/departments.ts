"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { unstable_noStore as noStore } from "next/cache";

export async function getDepartments() {
  noStore();
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        name: "asc",
      },
    });
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function createDepartment(data: { name: string; description?: string }) {
  try {
    // Tự động tạo mã khoa từ tên: "Khoa Nội" -> "KHOA_NOI"
    const code = data.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w]/g, "");

    const dept = await prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
        code: code,
      },
    });
    revalidatePath("/dashboard/departments");
    return { success: true, department: dept };
  } catch (error: any) {
    console.error("Error creating department:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDepartment(id: string, data: { name: string; description?: string }) {
  try {
    const dept = await prisma.department.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/departments");
    return { success: true, department: dept };
  } catch (error: any) {
    console.error("Error updating department:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.delete({
      where: { id },
    });
    revalidatePath("/dashboard/departments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false };
  }
}

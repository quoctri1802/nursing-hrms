"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { unstable_noStore as noStore } from "next/cache";

export async function getStaff(departmentId?: string) {
  noStore();
  try {
    const whereClause = departmentId ? { departmentId } : {};
    
    const staff = await prisma.user.findMany({
      where: whereClause,
      include: {
        department: true,
      },
      orderBy: {
        employeeCode: "asc",
      },
    });
    return staff;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}

export async function createStaff(data: any) {
  try {
    // KIỂM TRA TRÙNG MÃ NHÂN VIÊN
    const existingUser = await prisma.user.findUnique({
      where: { employeeCode: data.employeeCode }
    });

    if (existingUser) {
      return { success: false, error: "Mã nhân viên này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại." };
    }

    const hashedPassword = await bcrypt.hash(data.password || "123456", 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        experienceYears: parseInt(data.experienceYears) || 0,
      },
    });
    revalidatePath("/dashboard/staff");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error creating staff:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStaff(id: string, data: any) {
  try {
    const updateData = { ...data };
    
    // Nếu có mật khẩu mới thì hash
    if (updateData.password && updateData.password.length > 0) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    if (updateData.experienceYears) {
      updateData.experienceYears = parseInt(updateData.experienceYears) || 0;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/staff");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStaff(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false };
  }
}

export async function importStaff(staffList: any[]) {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    // Convert data to Prisma format
    const usersData = staffList.map(s => ({
      employeeCode: s.employeeCode.toString(),
      name: s.name,
      email: s.email || null,
      phone: s.phone || null,
      role: s.role || "NURSE",
      position: s.position || "Điều dưỡng",
      level: s.level || "Đại học",
      experienceYears: parseInt(s.experienceYears) || 0,
      password: hashedPassword,
      departmentId: s.departmentId || null,
    }));

    // For SQLite, we might need to do multiple creates or use createMany if supported (Prisma 7 supports it for SQLite)
    const result = await prisma.user.createMany({
      data: usersData,
    });

    revalidatePath("/dashboard/staff");
    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Error importing staff:", error);
    return { success: false, error: error.message };
  }
}

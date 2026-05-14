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
  console.log("Creating staff with data:", JSON.stringify(data, null, 2));
  try {
    // 1. Kiểm tra mã nhân viên
    if (!data.employeeCode) {
      return { success: false, error: "Thiếu mã nhân viên." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { employeeCode: data.employeeCode }
    });

    if (existingUser) {
      return { success: false, error: "Mã nhân viên này đã tồn tại trong hệ thống." };
    }

    // 2. Xử lý các trường tùy chọn
    const email = (data.email && data.email.trim() !== "") ? data.email.trim() : null;
    const phone = (data.phone && data.phone.trim() !== "") ? data.phone.trim() : null;
    const departmentId = (data.departmentId && data.departmentId !== "") ? data.departmentId : null;
    
    // 3. Kiểm tra trùng email (nếu email không null)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email }
      });
      if (existingEmail) {
        return { success: false, error: "Email này đã được sử dụng bởi nhân viên khác." };
      }
    }

    // 4. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(data.password || "123456", 10);
    
    // 5. Tạo mới
    const user = await prisma.user.create({
      data: {
        employeeCode: data.employeeCode,
        name: data.name,
        email: email,
        phone: phone,
        role: data.role || "NURSE",
        position: data.position || "Điều dưỡng",
        level: data.level || "Đại học",
        experienceYears: parseInt(data.experienceYears) || 0,
        departmentId: departmentId,
        password: hashedPassword,
      },
    });

    revalidatePath("/dashboard/staff");
    return { success: true, user };
  } catch (error: any) {
    console.error("DEBUG: Prisma Error Details:", error);
    
    // Xử lý lỗi Unique Constraint từ Prisma
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) {
        return { success: false, error: "Lỗi: Email này đã tồn tại. Nếu bạn để trống, hãy đảm bảo không có khoảng trắng dư thừa." };
      }
      if (target.includes('employeeCode')) {
        return { success: false, error: "Lỗi: Mã nhân viên đã tồn tại." };
      }
      return { success: false, error: `Dữ liệu bị trùng lặp: ${target.join(', ')}` };
    }

    return { success: false, error: "Lỗi hệ thống: " + error.message };
  }
}

export async function updateStaff(id: string, data: any) {
  try {
    // 1. Xử lý các trường dữ liệu tùy chọn
    const email = (data.email && data.email.trim() !== "") ? data.email.trim() : null;
    const phone = (data.phone && data.phone.trim() !== "") ? data.phone.trim() : null;
    const departmentId = (data.departmentId && data.departmentId !== "") ? data.departmentId : null;

    const updateData: any = {
      employeeCode: data.employeeCode,
      name: data.name,
      email: email,
      phone: phone,
      role: data.role,
      position: data.position,
      level: data.level,
      experienceYears: parseInt(data.experienceYears) || 0,
      departmentId: departmentId,
    };
    
    // Nếu có mật khẩu mới thì hash
    if (data.password && data.password.length > 0) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // 2. Kiểm tra trùng mã nhân viên (nếu thay đổi)
    const existingUser = await prisma.user.findFirst({
      where: { 
        employeeCode: updateData.employeeCode,
        NOT: { id: id }
      }
    });

    if (existingUser) {
      return { success: false, error: "Mã nhân viên này đã tồn tại trong hệ thống." };
    }

    // 3. Kiểm tra trùng email (nếu email không null)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email: email,
          NOT: { id: id }
        }
      });
      if (existingEmail) {
        return { success: false, error: "Email này đã được sử dụng bởi nhân viên khác." };
      }
    }

    // 4. Cập nhật
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/staff");
    return { success: true, user };
  } catch (error: any) {
    console.error("DEBUG: Update Error Details:", error);
    
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) {
        return { success: false, error: "Lỗi: Email này đã tồn tại." };
      }
      return { success: false, error: "Lỗi: Dữ liệu bị trùng lặp." };
    }

    return { success: false, error: "Lỗi hệ thống: " + error.message };
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

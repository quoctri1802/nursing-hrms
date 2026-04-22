"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { unstable_noStore as noStore } from "next/cache";

import { randomUUID } from "crypto";

export async function getSchedule(month: number, year: number, departmentId?: string) {
  noStore();
  try {
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Truy vấn lịch bằng Raw SQL để đảm bảo đồng nhất
    const rawSchedules: any[] = await prisma.$queryRaw`
      SELECT 
        s.*, 
        u.name as "userName", 
        u.employeeCode as "userEmployeeCode",
        u.departmentId as "userDepartmentId"
      FROM Schedule s
      LEFT JOIN User u ON s.userId = u.id
      WHERE strftime('%Y-%m-%d', s.date) >= ${startStr}
        AND strftime('%Y-%m-%d', s.date) <= ${endStr}
        ${departmentId ? prisma.raw(`AND u.departmentId = '${departmentId}'`) : prisma.raw('')}
    `;

    // Map lại format để tương thích với frontend (lồng user object)
    return rawSchedules.map(s => ({
      ...s,
      date: new Date(s.date), // Đảm bảo trả về Date object cho frontend
      user: {
        id: s.userId,
        name: s.userName,
        employeeCode: s.userEmployeeCode,
        departmentId: s.userDepartmentId
      }
    }));
  } catch (error) {
    console.error("Raw SQL getSchedule error:", error);
    return [];
  }
}

export async function updateSchedule(data: { date: Date; userId: string; shiftType: any }) {
  noStore();
  try {
    const year = data.date.getFullYear();
    const month = data.date.getMonth() + 1;
    const day = data.date.getDate();
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 1. Xóa tất cả ca trực của user này trong ngày này (Clean slate)
    await prisma.$executeRaw`
      DELETE FROM Schedule 
      WHERE userId = ${data.userId} 
      AND strftime('%Y-%m-%d', date) = ${dateKey}
    `;

    // 2. Nếu chọn một ca trực mới (không phải "-")
    if (data.shiftType && data.shiftType !== "") {
      const validShifts = ["ADMIN", "DUTY", "OFF"];
      if (validShifts.includes(data.shiftType)) {
        const newId = randomUUID();
        // Chèn bằng Raw SQL với định dạng ngày chuỗi để SQLite lưu trữ đồng nhất
        await prisma.$executeRaw`
          INSERT INTO Schedule (id, date, userId, shiftType, status) 
          VALUES (${newId}, ${dateKey + ' 00:00:00'}, ${data.userId}, ${data.shiftType}, 'CONFIRMED')
        `;
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/schedule");
    
    return { success: true };
  } catch (error: any) {
    console.error("Unified Raw Update Error:", error);
    return { 
      success: false, 
      error: error?.message || "Lỗi giao tiếp cơ sở dữ liệu." 
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

export async function getSchedule(month: number, year: number, departmentId?: string) {
  noStore();
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        user: departmentId ? {
          departmentId: departmentId
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            departmentId: true,
          }
        }
      }
    });

    return schedules.map(s => ({
      ...s,
      date: s.date,
      user: s.user
    }));
  } catch (error) {
    console.error("getSchedule error:", error);
    return [];
  }
}

export async function updateSchedule(data: { date: Date; userId: string; shiftType: any }) {
  noStore();
  try {
    // Chuẩn hóa ngày về 0h 0p 0s
    const targetDate = new Date(data.date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // 1. Xóa ca trực cũ trong ngày đó của user
    await prisma.schedule.deleteMany({
      where: {
        userId: data.userId,
        date: {
          gte: targetDate,
          lt: nextDay,
        }
      }
    });

    // 2. Nếu chọn một ca trực mới (không phải trống)
    const validShifts = ["ADMIN", "DUTY", "OFF"];
    if (data.shiftType && validShifts.includes(data.shiftType)) {
      await prisma.schedule.create({
        data: {
          date: targetDate,
          userId: data.userId,
          shiftType: data.shiftType,
          status: "CONFIRMED",
        }
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/dashboard/schedule");
    
    return { success: true };
  } catch (error: any) {
    console.error("Update Schedule Error:", error);
    return { 
      success: false, 
      error: error?.message || "Lỗi giao tiếp cơ sở dữ liệu." 
    };
  }
}

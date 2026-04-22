"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReport(data: any) {
  try {
    const report = await prisma.dailyReport.create({
      data: {
        totalStaff: data.totalStaff || 0,
        adminStaff: data.adminStaff || 0,
        dutyStaff: data.dutyStaff || 0,
        leaveStaff: data.leaveStaff || 0,
        patientsLevel1: data.patientsLevel1 || 0,
        patientsLevel2: data.patientsLevel2 || 0,
        patientsLevel3: data.patientsLevel3 || 0,
        suggestions: data.suggestions || "",
        departmentId: data.departmentId,
        date: new Date(),
      },
    });
    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
    return { success: true, report };
  } catch (error: any) {
    console.error("Error submitting report:", error);
    return { success: false, error: error.message };
  }
}

export async function getReports(departmentId?: string) {
  try {
    const reports = await prisma.dailyReport.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function deleteReport(id: string) {
  try {
    await prisma.dailyReport.delete({
      where: { id },
    });
    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting report:", error);
    return { success: false, error: error.message };
  }
}

export async function getLatestReport(departmentId: string) {
  try {
    const report = await prisma.dailyReport.findFirst({
      where: { departmentId },
      orderBy: { createdAt: "desc" },
      include: {
        department: true,
      },
    });
    return report;
  } catch (error) {
    console.error("Error fetching latest report:", error);
    return null;
  }
}

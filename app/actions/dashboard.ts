"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats(departmentId?: string) {
  try {
    const whereClause = departmentId ? { departmentId } : {};

    // 1. Lấy dữ liệu cơ bản song song
    const [totalHeadcount, totalDepts, departmentsWithReports] = await Promise.all([
      // Tổng quân số (mọi NV trừ Admin)
      prisma.user.count({ 
        where: { ...whereClause, role: { not: "ADMIN" } }
      }),
      // Tổng số khoa
      prisma.department.count(),
      // Lấy báo cáo mới nhất của từng khoa để tính số bệnh nhân và nhân sự trực
      prisma.department.findMany({
        where: departmentId ? { id: departmentId } : {},
        include: {
          reports: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    ]);

    // 2. Số báo cáo đã nạp riêng trong hôm nay
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const reportsTodayCount = await prisma.dailyReport.count({
      where: { 
        ...(departmentId ? { departmentId } : {}),
        createdAt: { gte: todayStart } 
      }
    });

    let totalPatients = 0;
    let totalOnDutyStaff = 0;
    let globalRequiredStaff = 0;

    const ratioData = departmentsWithReports.map(d => {
      const lastReport = d.reports[0];
      if (!lastReport) return { name: d.name, ratio: 0, limit: 4.5, patients: 0, staff: 0 };
      
      // Calculate Direct Care Staff (Tổng - Hành chính - Trực - Nghỉ)
      const s = lastReport.totalStaff - (
        (lastReport.adminStaff || 0) + 
        (lastReport.dutyStaff || 0) + 
        (lastReport.leaveStaff || 0)
      );
      
      const p1 = lastReport.patientsLevel1 || 0;
      const p2 = lastReport.patientsLevel2 || 0;
      const p3 = lastReport.patientsLevel3 || 0;
      const pTotal = p1 + p2 + p3;
      
      totalPatients += pTotal;
      totalOnDutyStaff += s; // This now refers to Direct Care Staff

      // Ratio = Patients / Nurse
      const ratio = s > 0 ? Number((pTotal / s).toFixed(1)) : 0;
      
      // Calculate Total Required based on standards (4, 8, 12)
      const totalRequired = Math.ceil(p1 / 4) + Math.ceil(p2 / 8) + Math.ceil(p3 / 12);
      const isOverloaded = s < totalRequired && pTotal > 0;
      
      // Accumulate global required staff
      globalRequiredStaff += totalRequired;
      
      return {
        name: d.name.replace("Khoa ", ""),
        ratio: ratio,
        limit: s > 0 ? Number((pTotal / (totalRequired > 0 ? totalRequired : 1)).toFixed(1)) : 4.5,
        isOverloaded,
        patients: pTotal,
        staff: s
      };
    });

    return {
      totalStaff: totalHeadcount, 
      totalOnDutyStaff, 
      totalPatients, 
      totalDepts,
      reportsToday: reportsTodayCount,
      totalExpectedReports: departmentId ? 1 : totalDepts,
      ratioData,
      totalRequiredStaff: globalRequiredStaff,
      isGlobalShortage: totalOnDutyStaff < globalRequiredStaff,
      lastUpdate: new Date().toLocaleTimeString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalStaff: 0,
      totalOnDutyStaff: 0,
      totalPatients: 0,
      totalDepts: 0,
      reportsToday: 0,
      totalExpectedReports: 0,
      ratioData: [],
      lastUpdate: "--:--"
    };
  }
}

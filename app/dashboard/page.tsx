import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Users, 
  Activity, 
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import DashboardChartsWrapper from "@/components/dashboard/DashboardChartsWrapper";

/**
 * Component hiển thị thẻ chỉ số tổng quát
 */
function StatCard({ title, value, subtitle, icon: Icon, color, isHighlight }: any) {
  const colors: any = {
    blue: "bg-blue-50/50 text-blue-600 border-blue-100/50 shadow-blue-900/5",
    red: "bg-red-50/50 text-red-600 border-red-100/50 shadow-red-900/5",
    green: "bg-green-50/50 text-green-600 border-green-100/50 shadow-green-900/5",
    orange: "bg-orange-50/50 text-orange-600 border-orange-100/50 shadow-orange-900/5",
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100/50 shadow-indigo-900/5",
  };

  return (
    <div 
      className={cn(
        "bg-white/70 backdrop-blur-md p-6 rounded-[32px] border transition-all hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden animate-fade-in-up",
        isHighlight ? "border-indigo-200 shadow-[0_20px_50px_rgba(79,70,229,0.1)] ring-4 ring-indigo-50/50" : "border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      )}
      style={{ animationDelay: `${Math.random() * 0.5}s` }}
    >
      {isHighlight && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 animate-pulse" />
      )}
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <p className={cn(
            "text-3xl font-black tracking-tighter tabular-nums",
            isHighlight ? "text-indigo-600" : "text-slate-900"
          )}>{value}</p>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-bold italic opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-2xl shadow-inner border transition-transform duration-500 group-hover:scale-110",
          colors[color || "blue"]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Component hiển thị dòng cảnh báo đơn vị
 */
function WarningRow({ name, status, ratio, staff, patients, isOverloaded }: any) {
  return (
    <tr className="hover:bg-slate-50/80 transition-all group">
      <td className="px-6 py-5 font-black text-slate-900 uppercase tracking-tighter">{name}</td>
      <td className="px-6 py-5">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${
          isOverloaded ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
        }`}>
          {isOverloaded ? "Cần điều phối" : "Ổn định"}
        </span>
      </td>
      <td className="px-6 py-5 text-center text-blue-600 font-black tabular-nums text-lg tracking-tighter">{ratio}</td>
      <td className="px-6 py-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-900 font-black">{staff}</span> 
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NV</span>
          <span className="text-slate-200">/</span>
          <span className="text-orange-600 font-black">{patients}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">BN</span>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all hover:underline">
          Chi tiết
        </button>
      </td>
    </tr>
  );
}

const dataTrend = [
  { day: "T2", value: 1.2 },
  { day: "T3", value: 1.5 },
  { day: "T4", value: 1.1 },
  { day: "T5", value: 2.4 },
  { day: "T6", value: 2.8 },
  { day: "T7", value: 2.2 },
  { day: "CN", value: 1.8 },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session?.user as any)?.role || "NURSE";
  const userDeptId = (session?.user as any)?.departmentId;
  const userDeptName = (session?.user as any)?.departmentName;

  const stats = await getDashboardStats(userRole === "HEAD_NURSE" ? userDeptId : undefined);
  const displayDeptName = userRole === "HEAD_NURSE" ? `Khoa ${userDeptName}` : "TTYT KHU VỰC LIÊN CHIỂU";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{displayDeptName}</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 italic shadow-slate-100">Hệ thống ghi nhận trạng thái lúc <span className="text-blue-600 font-bold">{stats?.lastUpdate || "--:--"}</span> hôm nay.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 bg-white/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 uppercase tracking-[0.2em]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Trạng thái: Hoạt động ổn định
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="ĐD Chăm sóc" 
          value={stats?.totalOnDutyStaff || 0} 
          subtitle={`Trong tổng số ${stats?.totalStaff || 0} NV`}
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Số bệnh nhân" 
          value={stats?.totalPatients || 0} 
          subtitle="Đang điều trị toàn viện"
          icon={Activity}
          color="orange"
        />
        <StatCard 
          title="Báo cáo ngày" 
          value={`${stats?.reportsToday || 0}/${stats?.totalExpectedReports || 0}`} 
          subtitle="Tiến độ nạp báo cáo khoa"
          icon={Activity}
          color="green"
        />
        <StatCard 
          title="Nhu cầu định mức" 
          value={`${stats?.totalRequiredStaff || 0} ĐD`} 
          subtitle={stats?.isGlobalShortage ? `Thiếu hụt ${stats?.totalRequiredStaff - stats?.totalOnDutyStaff} nhân sự` : "Đảm bảo định mức an toàn"}
          icon={ShieldCheck}
          color="indigo"
          isHighlight={true}
        />
      </div>

      {/* Tải biểu đồ thông qua Wrapper Client Component */}
      <DashboardChartsWrapper stats={stats} dataTrend={dataTrend} />

      {userRole === "ADMIN" && (
        <div className="bg-white/70 backdrop-blur-md rounded-[40px] border border-slate-200/60 shadow-2xl overflow-hidden mb-12">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-200"></div>
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Đơn vị cần phối hợp nhân lực gấp</h3>
            </div>
            <button className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] hover:underline transition-all">Xem tất cả báo cáo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] shadow-inner font-sans">
                <tr>
                  <th className="px-6 py-5">Khoa / Phòng</th>
                  <th className="px-6 py-5">Trạng thái</th>
                  <th className="px-6 py-5 text-center">Tỷ lệ BN / ĐD</th>
                  <th className="px-6 py-5 text-center">Nhân sự hiện tại</th>
                  <th className="px-6 py-5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.ratioData || [])
                  .filter((d: any) => d.isOverloaded)
                  .map((dept: any, idx: number) => (
                    <WarningRow 
                      key={idx}
                      name={dept.name}
                      ratio={dept.ratio}
                      staff={dept.staff}
                      patients={dept.patients}
                      isOverloaded={dept.isOverloaded}
                    />
                  ))
                }
                {(stats?.ratioData || []).filter((d: any) => d.isOverloaded).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                       <div className="flex flex-col items-center gap-2">
                          <Activity className="h-12 w-12 text-slate-100 mb-4" />
                          <p>Hiện tại không ghi nhận khoa nào ở trạng thái quá tải định mức.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Users, 
  Activity, 
  ClipboardList, 
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import DashboardChartsWrapper from "@/components/dashboard/DashboardChartsWrapper";

/**
 * Component hiển thị thẻ chỉ số tổng quát - Premium Version
 */
function StatCard({ title, value, subtitle, icon: Icon, color, isHighlight, delay }: any) {
  const colors: any = {
    blue: "bg-blue-600/10 text-blue-600 border-blue-200/50",
    orange: "bg-orange-600/10 text-orange-600 border-orange-200/50",
    green: "bg-green-600/10 text-green-600 border-green-200/50",
    indigo: "bg-indigo-600/10 text-indigo-600 border-indigo-200/50",
  };

  return (
    <div 
      className={cn(
        "glass-card p-7 rounded-4xl border transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden animate-premium",
        isHighlight ? "border-indigo-200 bg-indigo-50/20" : "border-white/40"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</p>
          <p className={cn(
            "text-4xl font-black tracking-tighter tabular-nums",
            isHighlight ? "text-indigo-700" : "text-slate-900"
          )}>{value}</p>
          {subtitle && (
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide opacity-80">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-2xl shadow-sm border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
          colors[color || "blue"]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {/* Decorative element */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

/**
 * Component hiển thị dòng cảnh báo đơn vị
 */
function WarningRow({ name, ratio, staff, patients, isOverloaded }: any) {
  return (
    <tr className="hover:bg-white/50 transition-all group">
      <td className="px-8 py-6 font-black text-slate-800 uppercase tracking-tighter text-base">{name}</td>
      <td className="px-8 py-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border",
          isOverloaded ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
        )}>
          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isOverloaded ? "bg-red-500" : "bg-green-500")} />
          {isOverloaded ? "Cần phối hợp" : "Ổn định"}
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <span className="text-blue-600 font-black tabular-nums text-2xl tracking-tighter">{ratio}</span>
        <span className="text-[10px] text-slate-400 ml-1 font-bold">BN/ĐD</span>
      </td>
      <td className="px-8 py-6 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex flex-col items-center">
             <span className="text-slate-900 font-black text-lg">{staff}</span>
             <span className="text-[8px] text-slate-400 font-black uppercase">Nhân sự</span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex flex-col items-center">
             <span className="text-orange-600 font-black text-lg">{patients}</span>
             <span className="text-[8px] text-slate-400 font-black uppercase">Bệnh nhân</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <button className="px-5 py-2.5 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all">
          Chi tiết
        </button>
      </td>
    </tr>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userRole = (session?.user as any)?.role || "NURSE";
  const userDeptId = (session?.user as any)?.departmentId;
  const userDeptName = (session?.user as any)?.departmentName;

  const stats = await getDashboardStats(userRole === "HEAD_NURSE" ? userDeptId : undefined);
  const displayDeptName = userRole === "HEAD_NURSE" ? `${userDeptName}` : "TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU";

  return (
    <div className="space-y-10 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
             <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Tổng quan nhân lực</h2>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">{displayDeptName}</h1>
          <p className="text-slate-400 text-sm font-medium tracking-tight">Cập nhật lần cuối: <span className="text-slate-900 font-bold">{stats?.lastUpdate || "--:--"}</span></p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-xl">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Hệ thống sẵn sàng</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="ĐD Chăm sóc" 
          value={stats?.totalOnDutyStaff || 0} 
          subtitle={`Trên tổng ${stats?.totalStaff || 0} NV`}
          icon={Users}
          color="blue"
          delay={100}
        />
        <StatCard 
          title="Bệnh nhân" 
          value={stats?.totalPatients || 0} 
          subtitle="Đang điều trị"
          icon={Activity}
          color="orange"
          delay={200}
        />
        <StatCard 
          title="Báo cáo ngày" 
          value={`${stats?.reportsToday || 0}/${stats?.totalExpectedReports || 0}`} 
          subtitle="Tiến độ hoàn thành"
          icon={ClipboardList}
          color="green"
          delay={300}
        />
        <StatCard 
          title="Định mức an toàn" 
          value={`${stats?.totalRequiredStaff || 0}`} 
          subtitle={stats?.isGlobalShortage ? "Cần bổ sung nhân sự" : "Đạt chuẩn an toàn"}
          icon={ShieldCheck}
          color="indigo"
          isHighlight={true}
          delay={400}
        />
      </div>

      {/* Charts Section */}
      <div className="animate-premium" style={{ animationDelay: '500ms' }}>
        <DashboardChartsWrapper stats={stats} />
      </div>

      {/* Warnings Table - Admin only */}
      {userRole === "ADMIN" && (
        <div className="glass-card rounded-4xl border-white/40 overflow-hidden animate-premium" style={{ animationDelay: '600ms' }}>
          <div className="p-10 border-b border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-red-600/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-2xl leading-none">Khoa phòng quá tải</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Các đơn vị cần điều phối nhân lực gấp</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.3em]">
                <tr>
                  <th className="px-8 py-5">Khoa / Phòng</th>
                  <th className="px-8 py-5">Trạng thái</th>
                  <th className="px-8 py-5 text-center">Tỷ lệ</th>
                  <th className="px-8 py-5 text-center">Phân bổ</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
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
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
                             <ShieldCheck className="h-10 w-10 text-blue-200" />
                          </div>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Toàn viện đang ở trạng thái an toàn</p>
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

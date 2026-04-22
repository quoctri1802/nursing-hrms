"use client";

import dynamic from "next/dynamic";

// Đây là component ranh giới để sử dụng dynamic(ssr: false)
// Vì ssr: false không được phép gọi trực tiếp trong Server Component.
const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-50/50 animate-pulse rounded-[40px] flex flex-col items-center justify-center border border-slate-100/50">
      <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Hệ thống phân tích đang khởi tạo...</p>
    </div>
  )
});

export default function DashboardChartsWrapper({ stats, dataTrend }: any) {
  return <DashboardCharts stats={stats} dataTrend={dataTrend} />;
}

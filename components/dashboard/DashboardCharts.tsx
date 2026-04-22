"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";

const TrendData = [
  { day: "T2", value: 45 },
  { day: "T3", value: 52 },
  { day: "T4", value: 48 },
  { day: "T5", value: 61 },
  { day: "T6", value: 55 },
  { day: "T7", value: 67 },
  { day: "CN", value: 60 },
];

export default function DashboardCharts({ stats }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chart 1: Ratio Bar Chart */}
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-[40px] border border-slate-200/60 shadow-xl flex flex-col group hover:border-blue-200 transition-all duration-500">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Tỷ lệ Bệnh nhân / Điều dưỡng</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dữ liệu phân bổ nhân sự hiện tại</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-inner">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Số BN trên 1 ĐD</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.ratioData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={9} 
                axisLine={false} 
                tickLine={false} 
                stroke="#94a3b8"
                tick={{ fontWeight: 800, textTransform: 'uppercase' }}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                stroke="#94a3b8"
                tick={{ fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 10 }}
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                  padding: '16px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="ratio" radius={[12, 12, 0, 0]} barSize={28}>
                {(stats?.ratioData || []).map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isOverloaded ? '#ef4444' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Trend Line Chart */}
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-[40px] border border-slate-200/60 shadow-xl flex flex-col group hover:border-green-200 transition-all duration-500">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Xu hướng Nhân lực trực</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Biến động quân số trong tuần</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100 shadow-sm transition-transform group-hover:scale-110">
            <TrendingUp className="h-4 w-4" />
            <span className="tracking-widest uppercase">Tăng ổn định</span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TrendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                stroke="#94a3b8"
                tick={{ fontWeight: 800 }}
              />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                stroke="#94a3b8"
                tick={{ fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                  padding: '16px',
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={6} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 4, stroke: '#fff' }}
                activeDot={{ r: 10, strokeWidth: 0, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

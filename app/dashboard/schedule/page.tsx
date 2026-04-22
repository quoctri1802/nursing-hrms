"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getStaff } from "@/app/actions/staff";
import { getSchedule, updateSchedule } from "@/app/actions/schedule";
import { getDepartments } from "@/app/actions/departments";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Save,
  AlertCircle,
  FileDown,
  RefreshCw,
  ShieldCheck,
  ClipboardList,
  Heart,
  Briefcase,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

const SHIFT_TYPES = [
  { label: "Hành chính", value: "ADMIN", color: "bg-blue-600 text-white border-blue-700 shadow-blue-900/10", tag: "HC" },
  { label: "Trực", value: "DUTY", color: "bg-rose-600 text-white border-rose-700 shadow-rose-900/10", tag: "Tr" },
  { label: "Nghỉ", value: "OFF", color: "bg-slate-400 text-white border-slate-500 shadow-slate-900/10", tag: "N" },
];

export default function SchedulePage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "NURSE";
  const [staff, setStaff] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]); // Keep raw for totals
  const [scheduleMap, setScheduleMap] = useState<Record<string, string>>({}); // For fast cell lookup
  const [currentDate, setCurrentDate] = useState(new Date());
  const [processingCell, setProcessingCell] = useState<string | null>(null); // userId-day
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('vi-VN', { month: 'long' });
  const year = currentDate.getFullYear();

  // Helper to get YYYY-MM-DD from a Date object in local time
  const getLocalDateKey = (date: Date | string) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [departments, setDepartments] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    
    // Nếu là Admin, dùng filterDept. Nếu là HEAD_NURSE, dùng departmentId của mình.
    const effectiveDeptId = userRole === "ADMIN" || userRole === "NURSE_DIRECTOR" 
      ? (filterDept === "all" ? undefined : filterDept)
      : (session?.user as any)?.departmentId;
    
    const [staffData, scheduleData, deptsData] = await Promise.all([
      getStaff(effectiveDeptId),
      getSchedule(currentDate.getMonth() + 1, currentDate.getFullYear(), effectiveDeptId),
      userRole === "ADMIN" || userRole === "NURSE_DIRECTOR" ? getDepartments() : Promise.resolve([])
    ]);

    setStaff(staffData);
    setSchedules(scheduleData);
    
    // Build the high-performance map
    const map: Record<string, string> = {};
    scheduleData.forEach((s: any) => {
      const key = getLocalDateKey(s.date);
      map[`${s.userId}:${key}`] = s.shiftType;
    });
    setScheduleMap(map);
    
    if (deptsData && deptsData.length > 0) setDepartments(deptsData);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetchData();
    }
  }, [currentDate, session, userRole, filterDept]);

  const handleShiftChange = async (userId: string, day: number, shiftType: string) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = getLocalDateKey(date);
    const cellKey = `${userId}-${day}`;
    
    setProcessingCell(cellKey);
    const res = await updateSchedule({ date, userId, shiftType });
    
    if (res.success) {
      // Update the Map immediately (Single Source of Truth)
      setScheduleMap(prev => {
        const newMap = { ...prev };
        if (!shiftType || shiftType === "") {
          delete newMap[`${userId}:${dateKey}`];
        } else {
          newMap[`${userId}:${dateKey}`] = shiftType;
        }
        return newMap;
      });
      
      // Update the array for calculations
      let updatedSchedules = [...schedules];
      const index = updatedSchedules.findIndex(s => {
        const sDateKey = getLocalDateKey(s.date);
        return s.userId === userId && sDateKey === dateKey;
      });

      if (index > -1) {
        if (!shiftType || shiftType === "") {
          updatedSchedules = updatedSchedules.filter((_, i) => i !== index);
        } else {
          updatedSchedules[index].shiftType = shiftType;
        }
      } else if (shiftType && shiftType !== "") {
        updatedSchedules.push({ userId, date, shiftType });
      }
      setSchedules(updatedSchedules);
    } else {
      alert(`Không thể lưu ca trực: ${res.error || "Lỗi hệ thống"}. Vui lòng thử lại.`);
    }
    setProcessingCell(null);
  };

  const getShift = (userId: string, day: number) => {
    const dateKey = getLocalDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return scheduleMap[`${userId}:${dateKey}`];
  };

  const getDailyTotal = (day: number, type: string) => {
    const dateKey = getLocalDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return schedules.filter(s => {
      const sDateKey = getLocalDateKey(s.date);
      return sDateKey === dateKey && s.shiftType === type;
    }).length;
  };

  const getStaffMonthlyTotal = (userId: string, type: string) => {
    return schedules.filter(s => 
      s.userId === userId && 
      s.shiftType === type
    ).length;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />;
      case "NURSE_DIRECTOR": return <Briefcase className="h-3.5 w-3.5 text-indigo-500" />;
      case "HEAD_NURSE": return <ClipboardList className="h-3.5 w-3.5 text-blue-500" />;
      default: return <Heart className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  const handleExport = () => {
    const data = staff.map((person) => {
      const row: any = {
        "Họ tên": person.name,
        "Mã NV": person.employeeCode,
        "Chức vụ": person.position || "Điều dưỡng",
      };
      
      for (let day = 1; day <= daysInMonth; day++) {
        const shift = getShift(person.id, day);
        row[`Ngày ${day}`] = shift === "ADMIN" ? "HC" : (shift === "DUTY" ? "T" : (shift === "OFF" ? "N" : "-"));
      }
      
      row["Tổng Hành chính"] = getStaffMonthlyTotal(person.id, "ADMIN");
      row["Tổng Trực"] = getStaffMonthlyTotal(person.id, "DUTY");
      row["Tổng Nghỉ"] = getStaffMonthlyTotal(person.id, "OFF");
      
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lịch trực");
    XLSX.writeFile(wb, `Lich_truc_${monthName}_${year}.xlsx`);
  };

  if (!isMounted) return null;

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" suppressHydrationWarning>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Xếp lịch trực tháng </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Phân bổ ca trực và quản lý thời gian làm việc của đội ngũ điều dưỡng.(Hệ thống đang hoàn thiện tính năng)</p>
        </div>
        <div className="flex items-center gap-3">
          {(userRole === "ADMIN" || userRole === "NURSE_DIRECTOR") && (
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo đơn vị:</p>
              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-tighter shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[200px]"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="all">Tất cả khoa phòng</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời gian:</p>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-5 text-xs font-black min-w-[150px] text-center uppercase tracking-widest">
                {monthName} {year}
              </div>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="pt-4 flex items-center gap-2">
            <button 
              onClick={fetchData}
              className="p-3 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <FileDown className="h-4 w-4" />
              Sổ trực (Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Info */}
      <div className="flex flex-col md:flex-row items-stretch gap-6">
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-6 flex-1">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
             <Calendar className="h-4 w-4 text-blue-600" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kí hiệu ca:</span>
          </div>
          {SHIFT_TYPES.map(type => (
            <div key={type.value} className="flex items-center gap-3 group">
              <div className={cn("w-3.5 h-3.5 rounded-md border shadow-sm group-hover:scale-110 transition-transform", type.color.split(" ")[0])}></div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{type.label}</span>
            </div>
          ))}
        </div>
        <div className="bg-blue-600 text-white p-5 rounded-[24px] shadow-xl shadow-blue-100 flex items-center gap-4 min-w-[280px]">
           <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Save className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Trạng thái lưu trữ</p>
              <p className="text-xs font-bold">Lịch trực tự động lưu sau mỗi thay đổi</p>
           </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-slate-200/60 shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-6 min-w-[240px] sticky left-0 bg-white z-20 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] shadow-[5px_0_15px_rgba(0,0,0,0.02)] border-r border-slate-100 italic">Nhân sự</th>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th 
                      key={day} 
                      onMouseEnter={() => setHoverCol(day)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={cn(
                        "px-2 py-6 text-center min-w-[55px] font-black text-[10px] uppercase tracking-tighter border-l border-slate-100/50 transition-colors",
                        isWeekend ? "text-red-500 bg-red-50/30" : "text-slate-400 bg-slate-50/20",
                        hoverCol === day && "bg-blue-50/50 text-blue-600"
                      )}
                    >
                      {day}
                      <span className="block text-[8px] font-bold mt-1 opacity-60 uppercase tracking-widest">
                        {date.toLocaleString('vi-VN', { weekday: 'short' })}
                      </span>
                    </th>
                  );
                })}
                <th className="px-4 py-6 bg-slate-100/50 text-slate-500 font-black text-[10px] uppercase tracking-widest text-center border-l border-slate-200 min-w-[120px]">Tổng cộng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={daysInMonth + 1} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 rounded-full border-2 border-slate-100 border-t-blue-600 animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải lịch trực...</p>
                    </div>
                  </td>
                </tr>
              ) : staff.map((person) => (
                <tr 
                  key={person.id} 
                  onMouseEnter={() => setHoverRow(person.id)}
                  onMouseLeave={() => setHoverRow(null)}
                  className={cn(
                    "transition-all group",
                    hoverRow === person.id ? "bg-blue-50/40" : "hover:bg-slate-50/50"
                  )}
                >
                  <td className={cn(
                    "px-6 py-4 sticky left-0 z-10 border-r border-slate-100 shadow-[5px_0_15px_rgba(0,0,0,0.02)] transition-colors",
                    hoverRow === person.id ? "bg-blue-50/80" : "bg-white group-hover:bg-slate-50/80"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-lg ring-4 ring-white group-hover:scale-105 transition-transform shrink-0">
                        {person.name.split(" ").pop()?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                           {getRoleIcon(person.role)}
                           <p className="font-black text-slate-900 text-[11px] uppercase tracking-tighter truncate">{person.name}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 ml-5">{person.position || "Điều dưỡng"}</p>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const shift = getShift(person.id, day);
                    const shiftType = SHIFT_TYPES.find(t => t.value === shift);
                    const isProcessing = processingCell === `${person.id}-${day}`;
                    
                    return (
                      <td 
                        key={day} 
                        className={cn(
                          "p-1 text-center group/cell relative border-l border-slate-100/50 transition-colors",
                          hoverCol === day && "bg-blue-600/5"
                        )}
                        onMouseEnter={() => setHoverCol(day)}
                        onMouseLeave={() => setHoverCol(null)}
                      >
                        <div className="relative">
                          <select 
                            value={shift || ""}
                            disabled={isProcessing}
                            onChange={(e) => handleShiftChange(person.id, day, e.target.value)}
                            className={cn(
                              "w-full h-9 flex items-center justify-center text-[10px] font-black rounded-xl border transition-all cursor-pointer text-center outline-none shadow-md uppercase tracking-tighter pr-1",
                              shiftType 
                                ? cn(shiftType.color, "ring-2 ring-white/20") 
                                : "bg-white border-slate-100 text-slate-300 hover:border-blue-300 hover:text-blue-500",
                              isProcessing && "opacity-50 cursor-wait"
                            )}
                          >
                            <option value="" className="text-slate-400 font-bold bg-white">-</option>
                            {SHIFT_TYPES.map(t => (
                              <option key={t.value} value={t.value} className="bg-white text-slate-900 font-bold py-2">{t.label}</option>
                            ))}
                          </select>
                          {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-4 bg-slate-50/30 border-l border-slate-200">
                     <div className="flex items-center justify-center gap-1.5 flex-col lg:flex-row">
                        <div className="flex items-center gap-1" title="Hành chính">
                           <div className="w-2 h-2 rounded-full bg-indigo-500" />
                           <span className="text-[10px] font-black tabular-nums">{getStaffMonthlyTotal(person.id, "ADMIN")}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Trực">
                           <div className="w-2 h-2 rounded-full bg-red-500" />
                           <span className="text-[10px] font-black tabular-nums">{getStaffMonthlyTotal(person.id, "DUTY")}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-40" title="Nghỉ">
                           <div className="w-2 h-2 rounded-full bg-slate-400" />
                           <span className="text-[10px] font-black tabular-nums">{getStaffMonthlyTotal(person.id, "OFF")}</span>
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
              {/* Summary Footer Row */}
              <tr className="bg-slate-900 text-white font-sans border-t-2 border-slate-900">
                <td className="px-6 py-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                  <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-blue-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tổng quân số ngày</p>
                  </div>
                </td>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const adminCount = getDailyTotal(day, "ADMIN");
                  const dutyCount = getDailyTotal(day, "DUTY");
                  return (
                    <td key={day} className="px-1 py-4 border-l border-slate-800 text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <span className="text-[10px] font-black tabular-nums text-white leading-none" title="Hành chính">{adminCount}</span>
                        <div className="w-4 h-px bg-white/10" />
                        <span className="text-[10px] font-black tabular-nums text-red-400 leading-none" title="Trực">{dutyCount}</span>
                      </div>
                    </td>
                  );
                })}
                <td className="px-2 py-4 bg-slate-800 text-center">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Thống kê</p>
                   <p className="text-[10px] font-bold text-blue-400 italic">Thực hiện</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-4 p-8 bg-slate-900/5 backdrop-blur-sm border border-white rounded-[32px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-full bg-blue-600/5 -skew-x-12 translate-x-12 group-hover:translate-x-8 transition-transform duration-1000"></div>
        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg relative z-10">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="text-xs relative z-10">
          <p className="font-black text-slate-900 uppercase tracking-widest mb-2">Thông tin & Quy định xếp lịch:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-slate-500 font-medium italic">
            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-blue-600" /> Đảm bảo định mức tối thiểu 2 ĐD trực mỗi ca ICU.</li>
            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-blue-600" /> Ưu tiên sắp xếp nhân sự Hành chính vào các ngày cao điểm.</li>
            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-blue-600" /> Lịch trực được khóa vào ngày 25 hằng tháng.</li>
            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-blue-600" /> Vui lòng kiểm tra kỹ trước khi xuất bản PDF.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { submitReport, getReports, deleteReport, getLatestReport } from "@/app/actions/reports";
import { getDepartments } from "@/app/actions/departments";
import { 
  ClipboardCheck, 
  History, 
  Calculator, 
  AlertCircle,
  Users,
  Bed,
  CheckCircle2,
  Eye,
  Printer,
  X,
  FileText,
  Download,
  Building2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Check,
  Trash2,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

/**
 * Component helper cho việc nhập số liệu
 */
function InputNumber({ label, value, name, setFormData }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input 
        type="number" 
        min="0"
        value={value}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, [name]: parseInt(e.target.value) || 0 }))}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-semibold shadow-sm"
      />
    </div>
  );
}

/**
 * Component Modal xem trước báo cáo (Preview)
 */
function ReportPreviewModal({ report, onClose }: { report: any, onClose: () => void }) {
  if (!report) return null;

  // Đảm bảo các giá trị không bị NaN nếu DB trả về null/undefined
  const totalStaff = report.totalStaff || 0;
  const adminStaff = report.adminStaff || 0;
  const dutyStaff = report.dutyStaff || 0;
  const clinicStaff = report.clinicStaff || 0;
  const postDutyStaff = report.postDutyStaff || 0;
  const leaveStaff = report.leaveStaff || 0;

  const patientsLevel1 = report.patientsLevel1 || 0;
  const patientsLevel2 = report.patientsLevel2 || 0;
  const patientsLevel3 = report.patientsLevel3 || 0;

  const totalS = totalStaff - (adminStaff + dutyStaff + leaveStaff);
  const totalP = patientsLevel1 + patientsLevel2 + patientsLevel3;
  const ratio = (totalP / (totalS > 0 ? totalS : 1)).toFixed(1);

  // Tính toán định mức theo tiêu chuẩn mới
  const neededL1 = Math.ceil(patientsLevel1 / 4);
  const neededL2 = Math.ceil(patientsLevel2 / 8);
  const neededL3 = Math.ceil(patientsLevel3 / 12);
  const totalNeeded = neededL1 + neededL2 + neededL3;
  const isShortage = totalS < totalNeeded && totalP > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 font-sans">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Báo cáo chi tiết</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Printer className="h-4 w-4" />
              In báo cáo
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-white print:p-0 print:overflow-visible" id="printable-report">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đơn vị công tác</p>
                <h3 className="text-sm font-black uppercase">TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU</h3>
                <p className="text-xs font-bold italic">Khoa: {report.department?.name}</p>
              </div>
              <div className="text-right space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mã báo cáo: #{report.id?.slice(-6).toUpperCase() || "N/A"}</p>
                 <p className="text-xs font-bold italic">Ngày lập: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">BÁO CÁO CÔNG TÁC ĐIỀU DƯỠNG</h1>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 font-serif italic">Bản tin tình hình và định mức nhân lực hằng ngày</p>
            </div>

            <div className="grid grid-cols-2 gap-8 border-2 border-slate-100 p-8 rounded-3xl">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">I. Tình hình Nhân sự</h4>
                <div className="grid grid-cols-2 gap-y-3 text-[11px] font-bold">
                  <span className="text-slate-500">Tổng nhân sự:</span> <span>{totalStaff} NV</span>
                  <span className="text-slate-500">Hành chính:</span> <span>{adminStaff} NV</span>
                  <span className="text-slate-500">Trực:</span> <span>{dutyStaff} NV</span>
                  <span className="text-slate-500">Nghỉ phép/ốm:</span> <span>{leaveStaff} NV</span>
                  <div className="col-span-2 h-px bg-slate-50 my-1"/>
                  <span className="text-slate-900 uppercase font-black">Chăm sóc trực tiếp:</span> <span className="text-blue-600 font-black">{totalS} Điều dưỡng</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b pb-2">II. Tình hình Bệnh nhân</h4>
                <div className="grid grid-cols-2 gap-y-3 text-[11px] font-bold">
                  <span className="text-slate-500">Bệnh nhân Cấp 1:</span> <span>{patientsLevel1} BN</span>
                  <span className="text-slate-500">Bệnh nhân Cấp 2:</span> <span>{patientsLevel2} BN</span>
                  <span className="text-slate-500">Bệnh nhân Cấp 3:</span> <span>{patientsLevel3} BN</span>
                  <div className="col-span-2 h-px bg-slate-50 my-1"/>
                  <span className="text-slate-900 uppercase font-black">Tỷ lệ BN/NV:</span> <span className="text-orange-600 font-black">{ratio}</span>
                  <div className="col-span-2 h-px bg-slate-50 my-1"/>
                  <span className="text-slate-900 uppercase font-black">Tổng cộng:</span> <span className="text-orange-600 font-black">{totalP} Bệnh nhân</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">III. Phân tích định mức nhân lực (Dựa trên tiêu chuẩn)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-500 italic">Cấp 1 (Trung bình 4 BN/ĐD):</span>
                     <span className="text-slate-900">{patientsLevel1} BN → <span className="text-blue-600">Cần {neededL1} ĐD</span></span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-500 italic">Cấp 2 (Trung bình 8 BN/ĐD):</span>
                     <span className="text-slate-900">{patientsLevel2} BN → <span className="text-blue-600">Cần {neededL2} ĐD</span></span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-500 italic">Cấp 3 (Trung bình 12 BN/ĐD):</span>
                     <span className="text-slate-900">{patientsLevel3} BN → <span className="text-blue-600">Cần {neededL3} ĐD</span></span>
                   </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center gap-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-400">Tổng nhu cầu định mức:</span>
                      <span className="text-lg font-black text-blue-600">{totalNeeded} ĐD</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-400">Thực tế trực tiếp:</span>
                      <span className={cn("text-lg font-black", isShortage ? "text-red-600" : "text-green-600")}>{totalS} ĐD</span>
                   </div>
                   <div className={cn(
                     "mt-2 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border",
                     isShortage ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                   )}>
                      {isShortage ? `Thiếu hụt ${totalNeeded - totalS} nhân sự chuyên môn` : "Đảm bảo định mức an toàn"}
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">IV. Đề xuất & Điều động nhân sự</h4>
              <div className="bg-slate-50 p-6 rounded-2xl italic text-sm text-slate-600 leading-relaxed border-l-4 border-blue-600 shadow-inner">
                "{report.suggestions || "Không có đề xuất bổ sung từ khoa."}"
              </div>
            </div>

            <div className="pt-12 flex justify-between px-10">
               <div className="text-center space-y-20">
                  <p className="text-[11px] font-black uppercase tracking-widest">Phòng điều dưỡng</p>
                  <p className="text-[10px] font-bold text-slate-300 italic">(Ký và ghi rõ họ tên)</p>
               </div>
               <div className="text-center space-y-20">
                  <p className="text-[11px] font-black uppercase tracking-widest">Tiểu ban nhân sự</p>
                  <p className="text-[10px] font-bold text-slate-300 italic">(Ký và ghi rõ họ tên)</p>
               </div>
               <div className="text-center space-y-20">
                  <p className="text-[11px] font-black uppercase tracking-widest leading-tight">Người lập báo cáo <br/> <span className="text-[9px] lowercase font-medium">Điều dưỡng trưởng khoa</span></p>
                  <p className="text-[10px] font-bold italic underline decoration-slate-200">Xác nhận chuyên môn</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Thông báo lỗi chuyên nghiệp
 */
function ErrorOverlay({ show, message, onConfirm }: { show: boolean, message: string, onConfirm: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-red-100">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50/50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Gửi thất bại</h3>
        <p className="text-slate-500 text-sm font-medium italic mb-8">{message || "Có lỗi xảy ra khi lưu báo cáo. Vui lòng thử lại sau."}</p>
        <button 
          onClick={onConfirm}
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl active:scale-95"
        >
          Đã hiểu và kiểm tra lại
        </button>
      </div>
    </div>
  );
}

/**
 * Component Thông báo thành công chuyên nghiệp
 */
function SuccessOverlay({ show, onConfirm }: { show: boolean, onConfirm: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50/50">
          <Check className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Đã gửi báo cáo</h3>
        <p className="text-slate-500 text-sm font-medium italic mb-8">Báo cáo tình hình nhân lực đã được hệ thống ghi nhận thành công.</p>
        <button 
          onClick={onConfirm}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Xác nhận và xem lịch sử
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("submit");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewReport, setPreviewReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [latestReport, setLatestReport] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    totalStaff: 0,
    adminStaff: 0,
    dutyStaff: 0,
    clinicStaff: 0,
    postDutyStaff: 0,
    leaveStaff: 0,
    patientsLevel1: 0,
    patientsLevel2: 0,
    patientsLevel3: 0,
    suggestions: ""
  });
  
  const [stats, setStats] = useState({
    totalStaff: 0,
    directCareStaff: 0,
    totalPatients: 0,
    ratio: 0,
    needed: { total: 0 }
  });

  const fetchData = async () => {
    setLoading(true);
    const userRole = (session?.user as any)?.role;
    const userDeptId = (session?.user as any)?.departmentId;
    if (!session) return;

    const [reportsData, deptsData, lastReportData] = await Promise.all([
      userRole === "ADMIN" || userRole === "NURSE_DIRECTOR" ? getReports() : getReports(userDeptId),
      getDepartments(),
      userDeptId ? getLatestReport(userDeptId) : Promise.resolve(null)
    ]);

    setReports(reportsData || []);
    setDepartments(deptsData || []);
    setLatestReport(lastReportData);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.role === "NURSE_DIRECTOR";

  // LOGIC PHÂN TÍCH AN TOÀN (SIDEBAR)
  const currentDayReports = reports.filter(r => new Date(r.createdAt).toISOString().split('T')[0] === filterDate);
  
  const aggregateStats = {
    staff: 0,
    patients: 0,
    ratio: 0,
    topShortages: [] as any[]
  };

  if (isAdmin) {
    aggregateStats.staff = currentDayReports.reduce((sum, r) => sum + ((r.totalStaff || 0) - ((r.adminStaff || 0) + (r.dutyStaff || 0) + (r.leaveStaff || 0))), 0);
    aggregateStats.patients = currentDayReports.reduce((sum, r) => sum + (r.patientsLevel1 || 0) + (r.patientsLevel2 || 0) + (r.patientsLevel3 || 0), 0);
    aggregateStats.ratio = aggregateStats.staff > 0 ? Number((aggregateStats.patients / aggregateStats.staff).toFixed(1)) : 0;
    
    aggregateStats.topShortages = currentDayReports
      .map(r => {
        const s = (r.totalStaff || 0) - ((r.adminStaff || 0) + (r.dutyStaff || 0) + (r.clinicStaff || 0) + (r.postDutyStaff || 0) + (r.leaveStaff || 0));
        const p1 = r.patientsLevel1 || 0;
        const p2 = r.patientsLevel2 || 0;
        const p3 = r.patientsLevel3 || 0;
        const pTotal = p1 + p2 + p3;
        const needed = Math.ceil(p1 / 4) + Math.ceil(p2 / 8) + Math.ceil(p3 / 12);
        return { 
          name: r.department?.name, 
          ratio: s > 0 ? Number((pTotal / s).toFixed(1)) : 0,
          isOverloaded: s < needed && pTotal > 0
        };
      })
      .filter(x => x.isOverloaded)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  } else {
    const myReport = currentDayReports.find(r => r.departmentId === user?.departmentId);
    if (myReport) {
      const s = (myReport.totalStaff || 0) - ((myReport.adminStaff || 0) + (myReport.dutyStaff || 0) + (myReport.leaveStaff || 0));
      aggregateStats.staff = s;
      aggregateStats.patients = (myReport.patientsLevel1 || 0) + (myReport.patientsLevel2 || 0) + (myReport.patientsLevel3 || 0);
      aggregateStats.ratio = aggregateStats.staff > 0 ? Number((aggregateStats.patients / aggregateStats.staff).toFixed(1)) : 0;
    }
  }

  useEffect(() => {
    const directCareStaff = (formData.totalStaff || 0) - (
      (formData.adminStaff || 0) + 
      (formData.dutyStaff || 0) + 
      (formData.leaveStaff || 0)
    );
    const totalPatients = (formData.patientsLevel1 || 0) + (formData.patientsLevel2 || 0) + (formData.patientsLevel3 || 0);
    
    const neededL1 = Math.ceil((formData.patientsLevel1 || 0) / 4);
    const neededL2 = Math.ceil((formData.patientsLevel2 || 0) / 8);
    const neededL3 = Math.ceil((formData.patientsLevel3 || 0) / 12);
    const totalNeeded = neededL1 + neededL2 + neededL3;

    setStats({
      totalStaff: formData.totalStaff || 0,
      directCareStaff: directCareStaff > 0 ? directCareStaff : 0,
      totalPatients,
      ratio: directCareStaff > 0 ? Number((totalPatients / directCareStaff).toFixed(1)) : 0,
      needed: { total: totalNeeded }
    });
  }, [formData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi báo cáo này không? Hành động này không thể hoàn tác.")) return;
    setDeletingId(id);
    const res = await deleteReport(id);
    if (res.success) {
      await fetchData();
    } else {
      alert("Xóa thất bại: " + res.error);
    }
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra thông tin phiên đăng nhập
    const deptId = (session?.user as any)?.departmentId;
    if (!deptId) {
      setErrorMessage("Tài khoản của bạn chưa được liên kết với Khoa/Phòng. Vui lòng liên hệ Admin để phân bổ đơn vị trước khi gửi báo cáo.");
      setShowError(true);
      return;
    }

    const res = await submitReport({
      ...formData,
      departmentId: deptId,
      suggestions: formData.suggestions || `Đề xuất: Cần khoảng ${stats.needed.total} điều dưỡng dựa trên định mức. Hiện có ${stats.totalStaff}. ${stats.totalStaff < stats.needed.total ? 'Nên huy động thêm.' : 'Đủ nhân sự.'}`
    });

    if (res.success) {
      setShowSuccess(true);
      fetchData();
      setFormData({
        totalStaff: 0,
        adminStaff: 0,
        dutyStaff: 0,
        clinicStaff: 0,
        postDutyStaff: 0,
        leaveStaff: 0,
        patientsLevel1: 0,
        patientsLevel2: 0,
        patientsLevel3: 0,
        suggestions: ""
      });
    } else {
      setErrorMessage(res.error || "Hệ thống gặp sự cố khi lưu trữ dữ liệu.");
      setShowError(true);
    }
  };

  const filteredReports = reports
    .filter(r => {
      const s = (r.totalStaff || 0) - ((r.adminStaff || 0) + (r.dutyStaff || 0) + (r.leaveStaff || 0));
      const p = (r.patientsLevel1 || 0) + (r.patientsLevel2 || 0) + (r.patientsLevel3 || 0);
      const needed = ((r.patientsLevel1 || 0) / 4) + ((r.patientsLevel2 || 0) / 8) + ((r.patientsLevel3 || 0) / 12);
      if (filterStatus === "shortage") return s < needed && p > 0;
      if (filterStatus === "stable") return s >= needed || p === 0;
      return true;
    })
    .filter(r => filterDept === "all" || r.departmentId === filterDept)
    .filter(r => filterDate ? new Date(r.createdAt).toISOString().split('T')[0] === filterDate : true);

  const missingDepts = departments.filter(dept => {
    return !reports.some(r => 
      r.departmentId === dept.id && 
      new Date(r.createdAt).toISOString().split('T')[0] === filterDate
    );
  });

  const handleExport = () => {
    let grandTotalStaff = 0;
    let grandTotalPatients = 0;

    const aoaData = [
      ["TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU - TP. ĐÀ NẴNG"],
      ["BÁO CÁO TỔNG HỢP TÌNH HÌNH NHÂN LỰC & BỆNH NHÂN"],
      [`Thời gian ghi nhận: ${new Date(filterDate).toLocaleDateString('vi-VN')}`],
      [`Người xuất báo cáo: ${session?.user?.name || "Hệ thống"}`],
      [],
      [
        "STT", 
        "Tên Khoa/Phòng", 
        "Tổng nhân lực", "Hành chính", "Trực", "Nghỉ", "Chăm sóc trực tiếp",
        "BN Cấp 1", "BN Cấp 2", "BN Cấp 3", "Tổng Bệnh nhân", 
        "Tỷ lệ BN/NV", "Tình trạng", "Ghi chú/Đề xuất"
      ]
    ];

    filteredReports.forEach((r, index) => {
      const s = (r.totalStaff || 0) - (
        (r.adminStaff || 0) + 
        (r.dutyStaff || 0) + 
        (r.leaveStaff || 0)
      );
      const p = (r.patientsLevel1 || 0) + (r.patientsLevel2 || 0) + (r.patientsLevel3 || 0);
      const ratioVal = (p / (s > 0 ? s : 1)).toFixed(1);
      const needed = ((r.patientsLevel1 || 0) / 4) + ((r.patientsLevel2 || 0) / 8) + ((r.patientsLevel3 || 0) / 12);
      
      grandTotalStaff += s;
      grandTotalPatients += p;

      aoaData.push([
        index + 1,
        r.department?.name || "N/A",
        r.totalStaff || 0,
        r.adminStaff || 0,
        r.dutyStaff || 0,
        r.leaveStaff || 0,
        s,
        r.patientsLevel1 || 0,
        r.patientsLevel2 || 0,
        r.patientsLevel3 || 0,
        p,
        ratioVal,
        (s < needed && p > 0) ? "[!!] QUÁ TẢI" : "Ổn định",
        r.suggestions || ""
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    const wscols = [
      { wch: 6 }, { wch: 35 }, 
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 50 },
    ];
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
    const fileName = `Bao_cao_nhan_luc_${filterDate.replace(/-/g, "")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-32">
      <SuccessOverlay show={showSuccess} onConfirm={() => { setShowSuccess(false); setActiveTab("history"); }} />
      <ErrorOverlay show={showError} message={errorMessage} onConfirm={() => setShowError(false)} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Quản lý Báo cáo Toàn viện</h1>
          <p className="text-slate-500 text-sm font-medium italic mt-2">Dữ liệu nhân lực điều dưỡng hằng ngày tại TTYT Khu vực Liên Chiểu.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm relative z-10 scale-90 md:scale-100 origin-right">
          <button 
            type="button"
            onClick={() => setActiveTab("submit")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
              activeTab === "submit" ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-slate-400 hover:bg-slate-50"
            )}
          >
            <ClipboardCheck className="h-4 w-4" />
            Lập báo cáo khoa
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
              activeTab === "history" ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "text-slate-400 hover:bg-slate-50"
            )}
          >
            <History className="h-4 w-4" />
            Lịch sử & Phân tích
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-32">
        <div className="lg:col-span-3 space-y-8">
           {activeTab === "submit" ? (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <form onSubmit={handleSubmit} className="xl:col-span-2 bg-white/70 backdrop-blur-xl p-10 rounded-[40px] border border-white shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <section className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-100">
                          <Users className="h-5 w-5" />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Cơ cấu Nhân lực</h3>
                      </div>
                      <div className="bg-blue-50/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Chăm sóc trực tiếp:</span>
                        <span className="text-xl font-black text-blue-600 tabular-nums">{stats.directCareStaff}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <InputNumber label="Tổng số nhân lực" value={formData.totalStaff} name="totalStaff" setFormData={setFormData} />
                      <InputNumber label="Nhân viên Hành chính" value={formData.adminStaff} name="adminStaff" setFormData={setFormData} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                      <InputNumber label="Nhân viên trực 24h/Đêm" value={formData.dutyStaff} name="dutyStaff" setFormData={setFormData} />
                      <InputNumber label="Nghỉ phép/ốm/vắng" value={formData.leaveStaff} name="leaveStaff" setFormData={setFormData} />
                    </div>
                  </section>

                  <div className="h-px bg-slate-100 w-full" />

                  <section className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-lg shadow-orange-100">
                          <Bed className="h-5 w-5" />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Số lượng bệnh nhân</h3>
                      </div>
                      <div className="bg-orange-50/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-3">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">TỶ LỆ BN/NV:</span>
                        <span className="text-xl font-black text-orange-600 tabular-nums">{stats.ratio}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <InputNumber label="Chăm sóc cấp 1" value={formData.patientsLevel1} name="patientsLevel1" setFormData={setFormData} />
                      <InputNumber label="Chăm sóc cấp 2" value={formData.patientsLevel2} name="patientsLevel2" setFormData={setFormData} />
                      <InputNumber label="Chăm sóc cấp 3" value={formData.patientsLevel3} name="patientsLevel3" setFormData={setFormData} />
                    </div>
                  </section>

                  <div className="pt-6 relative z-10">
                    <button 
                      type="submit"
                      className="group relative w-full flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] uppercase tracking-[0.2em] text-sm overflow-hidden"
                    >
                      <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] transition-transform duration-1000"></div>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Phát hành báo cáo ngày
                    </button>
                  </div>
               </form>

               {/* REFERENCE DATA PANEL */}
               <div className="space-y-6">
                  <div className="bg-white/50 backdrop-blur-md p-8 rounded-[32px] border border-white shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-slate-900 text-white p-2 rounded-xl">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Dữ liệu tham chiếu</h4>
                      </div>
                      
                      {latestReport ? (
                        <div className="space-y-5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">Lần báo cáo gần nhất: {new Date(latestReport.createdAt).toLocaleDateString('vi-VN')}</p>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { label: "Tổng nhân lực", val: latestReport.totalStaff, icon: Users, color: "text-blue-600" },
                              { label: "Tổng Bệnh nhân", val: (latestReport.patientsLevel1 || 0) + (latestReport.patientsLevel2 || 0) + (latestReport.patientsLevel3 || 0), icon: Bed, color: "text-orange-600" },
                              { label: "Chăm sóc trực tiếp", val: (latestReport.totalStaff || 0) - ((latestReport.adminStaff || 0) + (latestReport.dutyStaff || 0) + (latestReport.leaveStaff || 0)), icon: Check, color: "text-green-600" }
                            ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <item.icon className="h-3.5 w-3.5 text-slate-300" />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                                </div>
                                <span className={cn("text-xs font-black", item.color)}>{item.val}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                             <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 leading-none">Ghi chú gần nhất:</p>
                             <p className="text-[11px] text-blue-800 italic leading-snug line-clamp-3">"{latestReport.suggestions || "Không có ghi chú."}"</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center space-y-3 opacity-40">
                          <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 italic">Chưa có dữ liệu tham chiếu</p>
                        </div>
                      )}
                  </div>
                  
                  <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                     <div className="flex items-center gap-3 mb-4 relative z-10">
                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Hướng dẫn chuẩn</h4>
                     </div>
                     <p className="text-[11px] text-slate-400 leading-relaxed mb-6 italic relative z-10">Số liệu phải được kiểm chéo với sổ phân trực và số lượng bệnh nhân thực tế tại giường bệnh.</p>
                     <ul className="space-y-3 relative z-10">
                        {[
                          "Cấp 1: 2-4 BN/ĐD",
                          "Cấp 2: 5-8 BN/ĐD",
                          "Cấp 3: 9-12 BN/ĐD"
                        ].map((txt, i) => (
                          <li key={i} className="flex items-center gap-2 text-[10px] font-black">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                             {txt}
                          </li>
                        ))}
                     </ul>
                  </div>
               </div>
             </div>
           ) : (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-xl flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo ngày:</p>
                        <div className="relative">
                          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                          <input 
                            type="date" 
                            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khoa phòng:</p>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                            <select 
                              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all min-w-[200px] appearance-none"
                              value={filterDept}
                              onChange={(e) => setFilterDept(e.target.value)}
                            >
                              <option value="all">Tất cả đơn vị</option>
                              {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                  </div>
                  
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95 group"
                  >
                      <Download className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      Tải file tổng hợp
                  </button>
                </div>

                {isAdmin && missingDepts.length > 0 && filterDept === "all" && (
                  <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-start gap-5">
                        <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg shadow-red-200">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-red-900 font-black uppercase tracking-tighter text-lg">Cảnh báo: {missingDepts.length} khoa chưa báo cáo</h3>
                          <p className="text-red-600/70 text-xs font-bold uppercase tracking-widest mt-1 italic">Dữ liệu ghi nhận thiếu sót trong ngày {new Date(filterDate).toLocaleDateString('vi-VN')}:</p>
                          <div className="flex flex-wrap gap-2 mt-5">
                            {missingDepts.map(dept => (
                              <span key={dept.id} className="bg-white border border-red-200 px-4 py-2 rounded-xl text-[11px] font-black text-red-600 shadow-sm flex items-center gap-2 uppercase tracking-tight">
                                  <Building2 className="h-3.5 w-3.5 text-red-300" />
                                  {dept.name}
                              </span>
                            ))}
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                   {filteredReports.map((r) => {
                      const totalS = (r.totalStaff || 0) - (
                        (r.adminStaff || 0) + 
                        (r.dutyStaff || 0) + 
                        (r.leaveStaff || 0)
                      );
                      const totalP = (r.patientsLevel1 || 0) + (r.patientsLevel2 || 0) + (r.patientsLevel3 || 0);
                      const ratio = (totalP / (totalS > 0 ? totalS : 1)).toFixed(1);
                      const needed = Math.ceil((r.patientsLevel1 || 0) / 4) + Math.ceil((r.patientsLevel2 || 0) / 8) + Math.ceil((r.patientsLevel3 || 0) / 12);
                      const isS = totalS < needed && totalP > 0;

                      return (
                        <div key={r.id} className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group">
                          <div className={cn("h-1.5 w-full", isS ? "bg-red-500" : "bg-green-500")} />
                          <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[.25em] mb-2 leading-none italic">
                                  {new Date(r.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                                <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tighter truncate max-w-[180px]">{r.department?.name}</h3>
                              </div>
                              <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                isS ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                              )}>
                                {isS ? "Cần điều động" : "Ổn định"}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 tracking-widest leading-none">NV Trực</p>
                                <p className="text-lg font-black text-slate-800 tabular-nums">{totalS}</p>
                              </div>
                              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 tracking-widest leading-none">Tổng BN</p>
                                <p className="text-lg font-black text-slate-800 tabular-nums">{totalP}</p>
                              </div>
                              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 shadow-inner">
                                <p className="text-[8px] font-bold text-blue-400 uppercase mb-1 tracking-widest leading-none">Tỷ lệ</p>
                                <p className="text-lg font-black text-blue-600 tabular-nums">{ratio}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => setPreviewReport(r)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95"
                              >
                                  <Eye className="h-4 w-4" />
                                  Xem chi tiết
                              </button>
                              {isAdmin && (
                                <button 
                                  onClick={() => handleDelete(r.id)}
                                  disabled={deletingId === r.id}
                                  className="flex-none p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center active:scale-90"
                                  title="Xóa báo cáo"
                                >
                                    <Trash2 className={cn("h-4 w-4", deletingId === r.id && "animate-spin")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
             </div>
           )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calculator className="h-32 w-32" />
            </div>
            
            <div className="flex items-center gap-3 mb-10 relative z-10">
              <Calculator className="h-5 w-5 text-blue-400" />
              <h3 className="font-black uppercase tracking-tighter text-lg">{isAdmin ? "Tổng quan toàn viện" : "Phân tích ngày của khoa"}</h3>
            </div>

            <div className="space-y-10 relative z-10">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tỷ lệ BN / Điều dưỡng</span>
                  <span className={cn(
                    "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                    aggregateStats.ratio > 4.5 ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-green-500/20 text-green-400 border-green-500/40"
                  )}>
                    {aggregateStats.ratio > 4.5 ? "Quá định mức" : "Ngưỡng an toàn"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-blue-400 tracking-tighter tabular-nums leading-none">
                    {aggregateStats.ratio || 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BN/NV</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 italic">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-3 w-3" />
                  NV Trực
                  </p>
                  <p className="text-3xl font-black tabular-nums">{aggregateStats.staff}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Bed className="h-3 w-3" />
                  Tổng BN
                  </p>
                  <p className="text-3xl font-black tabular-nums">{aggregateStats.patients}</p>
                </div>
              </div>

              {isAdmin && aggregateStats.topShortages.length > 0 && (
                <div className="pt-8 border-t border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Đơn vị ưu tiên điều động
                  </h4>
                  <div className="space-y-3">
                    {aggregateStats.topShortages.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default shadow-sm shadow-black/20">
                        <span className="text-xs font-bold text-slate-100 uppercase tracking-tight truncate max-w-[120px]">{item.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black text-red-400">{item.ratio}</span>
                           <TrendingUp className="h-3 w-3 text-red-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-3 italic">
             <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-300" />
             </div>
             <div>
               <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Dữ liệu tham chiếu</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</p>
             </div>
          </div>
        </div>
      </div>

      <ReportPreviewModal 
        report={previewReport} 
        onClose={() => setPreviewReport(null)} 
      />

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { 
  getStaff, 
  deleteStaff,
  importStaff,
} from "@/app/actions/staff";
import { getDepartments } from "@/app/actions/departments";
import { StaffModal } from "@/components/staff-modal";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  FileUp, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit2,
  Download,
  Filter,
  Building2
} from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export default function StaffPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "NURSE";
  const userDeptId = (session?.user as any)?.departmentId;

  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    
    // Nếu là Điều dưỡng trưởng, chỉ lấy nhân viên của khoa mình
    const deptIdToFetch = userRole === "HEAD_NURSE" ? userDeptId : undefined;
    
    const [staffData, deptData] = await Promise.all([
      getStaff(deptIdToFetch),
      getDepartments()
    ]);
    setStaff(staffData);
    setDepartments(deptData);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, userRole, userDeptId]);

  const handleExport = () => {
    const dataToExport = filteredStaff.map(s => ({
      "Mã nhân viên": s.employeeCode,
      "Họ tên": s.name,
      "Khoa phòng": s.department?.name || "Chưa phân khoa",
      "Vai trò": s.role === "ADMIN" ? "Quản trị viên" : (s.role === "HEAD_NURSE" ? "Điều dưỡng trưởng" : "Điều dưỡng"),
      "Chức vụ": s.position || "Điều dưỡng",
      "Trình độ": s.level || "Đại học",
      "Kinh nghiệm (năm)": s.experienceYears || 0,
      "Email": s.email || "",
      "Số điện thoại": s.phone || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Set column widths
    const wscols = [
      { wch: 15 }, // Mã NV
      { wch: 25 }, // Họ tên
      { wch: 20 }, // Khoa phòng
      { wch: 15 }, // Vai trò
      { wch: 15 }, // Chức vụ
      { wch: 15 }, // Trình độ
      { wch: 15 }, // Kinh nghiệm
      { wch: 25 }, // Email
      { wch: 15 }, // SĐT
    ];
    ws["!cols"] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_sach");
    
    const fileName = `Bao_cao_Nhan_su_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Basic mapping
      const staffList = data.map((row: any) => ({
        employeeCode: row["Mã nhân viên"] || row["MSNV"] || row["code"],
        name: row["Họ tên"] || row["name"],
        email: row["Email"] || row["email"],
        phone: row["Số điện thoại"] || row["phone"],
        role: (row["Vai trò"] === "Trưởng khoa" || row["Vai trò"] === "Điều dưỡng trưởng") ? "HEAD_NURSE" : (row["Vai trò"] === "Quản trị" ? "ADMIN" : "NURSE"),
        position: row["Chức vụ"] || "Điều dưỡng",
        level: row["Trình độ"] || row["level"] || "Đại học",
        experienceYears: row["Kinh nghiệm"] || 0,
        departmentId: departments.find(d => d.name === row["Khoa"])?.id
      }));

      if (staffList.length > 0) {
        const res = await importStaff(staffList);
        if (res.success) {
          alert(`Đã nhập thành công ${res.count} nhân viên!`);
          fetchData();
        } else {
          alert("Lỗi khi nhập dữ liệu: " + res.error);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "all" || s.departmentId === selectedDept;
    const matchesRole = selectedRole === "all" || s.role === selectedRole;
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Quản lý Nhân sự</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Hệ thống ghi nhận hồ sơ nhân lực điều dưỡng toàn viện.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </button>
          <button 
            onClick={() => {
              setStaffToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Filters & Search - Glassmorphism */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col gap-6">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc mã nhân viên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-sm font-bold uppercase tracking-tight placeholder:text-slate-300"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {userRole === "ADMIN" && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Khoa / Phòng:</p>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-4 py-2.5 text-xs font-black bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm min-w-[180px] uppercase tracking-tighter"
                >
                  <option value="all">Tất cả khoa phòng</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò:</p>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2.5 text-xs font-black bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm min-w-[150px] uppercase tracking-tighter"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="HEAD_NURSE">Điều dưỡng trưởng</option>
                <option value="NURSE">Điều dưỡng</option>
              </select>
            </div>

            {(selectedDept !== "all" || selectedRole !== "all" || searchTerm !== "") && (
              <button 
                onClick={() => {
                  setSelectedDept("all");
                  setSelectedRole("all");
                  setSearchTerm("");
                }}
                className="mt-4 text-[10px] font-black text-red-500 hover:text-red-600 underline underline-offset-4 uppercase tracking-widest"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          <label className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-100 bg-blue-50/50 rounded-2xl hover:bg-blue-100 cursor-pointer transition-all active:scale-95 shadow-inner">
            <FileUp className="h-4 w-4" />
            Nhập Excel
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-[32px] border border-slate-200/60 shadow-xl overflow-hidden pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-100 shadow-inner">
              <tr>
                <th className="px-6 py-5">Nhân viên</th>
                <th className="px-6 py-5">Phân khoa</th>
                <th className="px-6 py-5 text-center">Trình độ</th>
                <th className="px-6 py-5 text-center">Kinh nghiệm</th>
                <th className="px-6 py-5 text-center">ID / Vai trò</th>
                <th className="px-6 py-5">Liên hệ</th>
                <th className="px-6 py-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 rounded-full border-2 border-slate-100 border-t-blue-600 animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải danh sách...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search className="h-8 w-8 text-slate-200 mb-2" />
                       <p className="text-slate-400 font-bold italic">Không tìm thấy nhân viên nào khớp với bộ lọc.</p>
                       <button onClick={() => {setSearchTerm(""); setSelectedDept("all");}} className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-2 hover:underline">Đặt lại tìm kiếm</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg ring-4 ring-white group-hover:scale-105 transition-transform">
                          {person.name.split(" ").pop()?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tighter">{person.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{person.position || "Điều dưỡng viên"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <Building2 className="h-3.5 w-3.5 text-slate-300" />
                         <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{person.department?.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                        {person.level || "Đại học"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <p className="text-lg font-black text-blue-600 tabular-nums tracking-tighter">{person.experienceYears || 0}<span className="text-[9px] text-slate-400 ml-0.5 uppercase tracking-normal">năm</span></p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">#{person.employeeCode}</span>
                        <RoleBadge role={person.role} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-bold text-slate-700">{person.email}</p>
                        <p className="text-[10px] font-bold text-slate-400 tabular-nums">{person.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setStaffToEdit(person);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm("Bạn có chắc chắn muốn xóa nhân viên này? Dữ liệu không thể khôi phục.")) {
                              await deleteStaff(person.id);
                              fetchData();
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
               Hiển thị {filteredStaff.length} / {staff.length} nhân sự hệ thống
             </p>
           </div>
           <div className="flex items-center gap-3">
             <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all">Trước</button>
             <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-sm active:scale-95 transition-all">Tiếp</button>
           </div>
        </div>
      </div>

      <StaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        departments={departments}
        staffToEdit={staffToEdit}
        currentUserRole={userRole}
        currentUserDeptId={userDeptId}
      />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: any = {
    ADMIN: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-900/5",
    HEAD_NURSE: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-900/5",
    NURSE: "bg-green-50 text-green-600 border-green-100 shadow-green-900/5",
  };

  const labels: any = {
    ADMIN: "Quản trị viên",
    HEAD_NURSE: "Điều dưỡng trưởng",
    NURSE: "Điều dưỡng",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
      styles[role] || styles.NURSE
    )}>
      {labels[role] || role}
    </span>
  );
}

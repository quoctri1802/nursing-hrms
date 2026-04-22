"use client";

import { useEffect, useState } from "react";
import { 
  getDepartments, 
  createDepartment, 
  deleteDepartment 
} from "@/app/actions/departments";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2,
  Users, 
  ChevronRight,
  Info,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateDepartment } from "@/app/actions/departments";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    const data = await getDepartments();
    setDepartments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setShowForm(false);
    setEditingDept(null);
  };

  const handleEdit = (dept: any) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingDept) {
      res = await updateDepartment(editingDept.id, { name, description });
    } else {
      res = await createDepartment({ name, description });
    }
    
    if (res.success) {
      resetForm();
      fetchDepartments();
    } else {
      alert("Lỗi: " + res.error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Cơ cấu Tổ chức</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Quản lý danh lục khoa phòng và phân bổ nhân sự bệnh viện.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm && !editingDept) setShowForm(false);
            else {
              setEditingDept(null);
              setName("");
              setDescription("");
              setShowForm(true);
            }
          }}
          className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Thêm khoa phòng
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md p-10 rounded-[32px] border border-blue-100/50 shadow-2xl shadow-blue-900/5 animate-in fade-in slide-in-from-top-4 relative group">
          <button 
            type="button"
            onClick={resetForm}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
               <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {editingDept ? `Chỉnh sửa: ${editingDept.name}` : "Thiết lập khoa phòng mới"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-1">Tên khoa/phòng *</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Khoa Cấp cứu, Khoa Nội..."
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none font-bold text-sm transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-1">Mô tả / Ghi chú</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thông tin bổ sung về chức năng nhiệm vụ..."
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none font-bold text-sm transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-10 pt-8 border-t border-slate-100">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
            >
              Bỏ qua
            </button>
            <button 
              type="submit"
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {editingDept ? "Lưu thay đổi" : "Kích hoạt khoa phòng"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({length: 6}).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100/50 animate-pulse rounded-[32px] border border-slate-200"></div>
          ))
        ) : departments.length === 0 ? (
          <div className="col-span-full py-24 bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[32px] text-center">
            <div className="flex flex-col items-center gap-3">
              <Building2 className="h-12 w-12 text-slate-200" />
              <p className="text-slate-400 font-bold italic">Chưa có dữ liệu khoa phòng trong hệ thống.</p>
              <button onClick={() => setShowForm(true)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-2 hover:underline">Khởi tạo ngay</button>
            </div>
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="bg-white/70 backdrop-blur-md p-8 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all group relative overflow-hidden">
              {/* Mesh Decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors"></div>
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm(`Xóa khoa phòng "${dept.name}"? Nhân viên thuộc khoa này sẽ cần được phân bổ lại.`)) {
                        await deleteDepartment(dept.id);
                        fetchDepartments();
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tighter leading-none">{dept.name}</h3>
                <p className="text-[10px] text-blue-600 font-black font-mono mb-4 uppercase tracking-[0.3em] opacity-60 italic">{dept.code || "TTYT-LC"}</p>
                <p className="text-sm text-slate-500 mb-8 min-h-[40px] line-clamp-2 font-medium italic opacity-80">
                  {dept.description || "Trung tâm Y tế khu vực Liên Chiểu - Khoa phòng chuyên môn."}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                       {Array.from({length: Math.min(dept._count?.users || 0, 3)}).map((_, i) => (
                         <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100" />
                       ))}
                       {(dept._count?.users || 0) > 3 && (
                         <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-600 text-[8px] font-black text-white flex items-center justify-center">
                           +{(dept._count?.users || 0) - 3}
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 leading-none">{dept._count?.users || 0}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Thành viên</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                    Chi tiết
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-900/5 p-6 rounded-[32px] border border-white shadow-inner flex items-start gap-4 mt-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-full bg-blue-600/5 -skew-x-12 translate-x-10"></div>
        <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
        <div className="space-y-1 relative z-10">
          <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Quy tắc Quản trị hệ thống:</p>
          <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
            Khi thay đổi hoặc xóa khoa phòng, hãy đảm bảo các báo cáo nhân lực liên quan đã được lưu trữ. <br/>
            Nhân viên của khoa bị xóa sẽ tạm thời chuyển về trạng thái <span className="text-blue-600 font-bold">"Chưa phân khoa"</span> để Admin điều động lại.
          </p>
        </div>
      </div>
    </div>
  );
}

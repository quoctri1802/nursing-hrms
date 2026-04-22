"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createStaff, updateStaff } from "@/app/actions/staff";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: any[];
  staffToEdit?: any;
  currentUserRole?: string;
  currentUserDeptId?: string;
}

export function StaffModal({
  isOpen,
  onClose,
  onSuccess,
  departments,
  staffToEdit,
  currentUserRole,
  currentUserDeptId
}: StaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeCode: "",
    name: "",
    email: "",
    phone: "",
    role: "NURSE",
    position: "Điều dưỡng",
    level: "Đại học",
    experienceYears: "0",
    departmentId: "",
    password: ""
  });

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        employeeCode: staffToEdit.employeeCode || "",
        name: staffToEdit.name || "",
        email: staffToEdit.email || "",
        phone: staffToEdit.phone || "",
        role: staffToEdit.role || "NURSE",
        position: staffToEdit.position || "Điều dưỡng",
        level: staffToEdit.level || "Đại học",
        experienceYears: staffToEdit.experienceYears?.toString() || "0",
        departmentId: staffToEdit.departmentId || "",
        password: "" // Không hiển thị mật khẩu cũ
      });
    } else {
      setFormData({
        employeeCode: "",
        name: "",
        email: "",
        phone: "",
        role: "NURSE",
        position: "Điều dưỡng",
        level: "Đại học",
        experienceYears: "0",
        departmentId: (currentUserRole === "HEAD_NURSE" ? currentUserDeptId : "") || "",
        password: ""
      });
    }
  }, [staffToEdit, isOpen, currentUserRole, currentUserDeptId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;
      if (staffToEdit) {
        res = await updateStaff(staffToEdit.id, formData);
      } else {
        res = await createStaff(formData);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            {staffToEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mã nhân viên *</label>
                <input
                  required
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: DD001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò hệ thống</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={currentUserRole === "HEAD_NURSE"}
                >
                  <option value="NURSE">Điều dưỡng viên</option>
                  <option value="HEAD_NURSE">Điều dưỡng trưởng</option>
                  <option value="NURSE_DIRECTOR">Trưởng phòng điều dưỡng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Khoa / Phòng</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={currentUserRole === "HEAD_NURSE"}
                >
                  <option value="">Chọn khoa/phòng</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Chức vụ</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Điều dưỡng viên"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Trình độ</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Chuyên khoa I Điều dưỡng">CKI Điều dưỡng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">KN (năm)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09xxx..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {staffToEdit ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu ban đầu *"}
                </label>
                <input
                  required={!staffToEdit}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={staffToEdit ? "••••••••" : "Mặc định: 123456"}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : staffToEdit ? "Cập nhật ngay" : "Thêm nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

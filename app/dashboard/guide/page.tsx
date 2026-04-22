import {
  BookOpen,
  HelpCircle,
  Clock,
  UserCheck,
  Calculator,
  FileText
} from "lucide-react";

export default function GuidePage() {
  const sections = [
    {
      title: "Xác thực & Truy cập",
      icon: UserCheck,
      content: [
        "Đăng nhập bằng mã nhân viên (VD: TRITNQ) và mật khẩu mặc định.",
        "Mỗi vai trò (Admin, Trưởng khoa, Điều dưỡng) sẽ có quyền hạn truy cập khác nhau.",
        "Thông tin cá nhân và khoa phòng sẽ được hiển thị trên thanh tiêu đề."
      ]
    },
    {
      title: "Báo cáo hằng ngày",
      icon: Calculator,
      content: [
        "Trưởng khoa thực hiện báo cáo tình hình nhân sự và bệnh nhân trước 16:00.",
        "Hệ thống tự động tính toán tỷ lệ Điều dưỡng/Bệnh nhân dựa trên định mức quy định.",
        "Định mức: Cấp 1 (1 NV/2 - 4 BN), Cấp 2 (1 NV/5 - 8 BN), Cấp 3 (1 NV/ 9 -12 BN).",
        "Nếu tỷ lệ vượt quá định mức, hệ thống sẽ đưa ra cảnh báo đỏ."
      ]
    },
    {
      title: "Xếp lịch trực",
      icon: Clock,
      content: [
        "Lịch trực được quản lý theo từng tháng.",
        "Chọn ca trực từ danh sách thả xuống: Sáng (S), Chiều (C), Tối (T), Trực (Tr), Nghỉ (N).",
        "Dữ liệu được lưu tự động ngay khi thay đổi."
      ]
    },
    {
      title: "Quản lý Nhân sự",
      icon: FileText,
      content: [
        "Admin có thể thêm mới hoặc nhập danh sách nhân viên hàng loạt từ file Excel.",
        "Tính năng Export Excel giúp tải danh sách nhân sự hiện tại về máy tính.",
        "Có thể tìm kiếm nhanh nhân viên theo tên hoặc mã số."
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Hướng dẫn sử dụng hệ thống</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Tài liệu hướng dẫn các thao tác cơ bản và quy trình nghiệp vụ trên ứng dụng Quản lý Nhân lực Điều dưỡng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap- Borser 6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-50 text-blue-600 rounded-lg">
                <section.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{section.title}</h3>
            </div>
            <ul className="space-y-3">
              {section.content.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/10 rounded-full">
            <HelpCircle className="h-10 w-10 text-blue-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Cần hỗ trợ kỹ thuật?</h3>
            <p className="text-slate-400 text-sm">
              Nếu bạn gặp khó khăn trong quá trình sử dụng hoặc phát hiện lỗi hệ thống, vui lòng liên hệ phòng CNTT hoặc gửi phản hồi trực tiếp.
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all whitespace-nowrap">
            Gửi phản hồi
          </button>
        </div>
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full -ml-24 -mb-24" />
      </div>
    </div>
  );
}

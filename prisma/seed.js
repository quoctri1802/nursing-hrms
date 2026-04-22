require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Bắt đầu quá trình seed dữ liệu...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log("✓ Đã xóa dữ liệu cũ");

  // ===== Create Departments =====
  const khoaNoi = await prisma.department.create({
    data: { name: "Khoa Nội tổng hợp", code: "KNOI" },
  });
  const khoaNgoai = await prisma.department.create({
    data: { name: "Khoa Ngoại chấn thương", code: "KNGOAI" },
  });
  const khoaHoiSuc = await prisma.department.create({
    data: { name: "Khoa Hồi sức tích cực", code: "KHSSTC" },
  });
  const khoaSan = await prisma.department.create({
    data: { name: "Khoa Sản", code: "KSAN" },
  });
  const khoaNhi = await prisma.department.create({
    data: { name: "Khoa Nhi", code: "KNHI" },
  });
  const phongKham = await prisma.department.create({
    data: { name: "Phòng khám đa khoa", code: "PKDK" },
  });

  console.log("✓ Đã tạo 6 khoa/phòng");

  // ===== Create Admin =====
  const admin = await prisma.user.create({
    data: {
      employeeCode: "ADMIN001",
      name: "Quản trị viên Hệ thống",
      email: "admin@hospital.vn",
      password: hashedPassword,
      role: "ADMIN",
      phone: "0901000001",
      position: "Quản trị viên",
    },
  });

  // ===== Create Head Nurses =====
  const headNurse1 = await prisma.user.create({
    data: {
      employeeCode: "TK001",
      name: "Trần Thị Hương",
      email: "huong.tt@hospital.vn",
      password: hashedPassword,
      role: "HEAD_NURSE",
      departmentId: khoaNoi.id,
      phone: "0901000010",
      position: "Điều dưỡng trưởng",
      level: "Đại học",
      experienceYears: 15,
    },
  });

  const headNurse2 = await prisma.user.create({
    data: {
      employeeCode: "TK002",
      name: "Lê Văn Minh",
      email: "minh.lv@hospital.vn",
      password: hashedPassword,
      role: "HEAD_NURSE",
      departmentId: khoaNgoai.id,
      phone: "0901000011",
      position: "Điều dưỡng trưởng",
      level: "Thạc sĩ",
      experienceYears: 12,
    },
  });

  const headNurse3 = await prisma.user.create({
    data: {
      employeeCode: "TK003",
      name: "Phạm Thị Lan",
      email: "lan.pt@hospital.vn",
      password: hashedPassword,
      role: "HEAD_NURSE",
      departmentId: khoaHoiSuc.id,
      phone: "0901000012",
      position: "Điều dưỡng trưởng",
      level: "Đại học",
      experienceYears: 10,
    },
  });

  // ===== Create Nurses =====
  const nurseData = [
    { code: "DD001", name: "Nguyễn Văn An", dept: khoaNoi.id, phone: "0902000001", level: "Đại học", exp: 5 },
    { code: "DD002", name: "Hoàng Thị Bình", dept: khoaNoi.id, phone: "0902000002", level: "Cao đẳng", exp: 3 },
    { code: "DD003", name: "Vũ Minh Cường", dept: khoaNoi.id, phone: "0902000003", level: "Đại học", exp: 7 },
    { code: "DD004", name: "Đặng Thị Dung", dept: khoaNoi.id, phone: "0902000004", level: "Đại học", exp: 4 },
    { code: "DD005", name: "Bùi Văn Em", dept: khoaNgoai.id, phone: "0902000005", level: "Cao đẳng", exp: 2 },
    { code: "DD006", name: "Lý Thị Phương", dept: khoaNgoai.id, phone: "0902000006", level: "Đại học", exp: 6 },
    { code: "DD007", name: "Trịnh Văn Giang", dept: khoaNgoai.id, phone: "0902000007", level: "Thạc sĩ", exp: 8 },
    { code: "DD008", name: "Mai Thị Hạnh", dept: khoaHoiSuc.id, phone: "0902000008", level: "Đại học", exp: 5 },
    { code: "DD009", name: "Phan Văn Khoa", dept: khoaHoiSuc.id, phone: "0902000009", level: "Đại học", exp: 4 },
    { code: "DD010", name: "Ngô Thị Linh", dept: khoaSan.id, phone: "0902000010", level: "Cao đẳng", exp: 3 },
    { code: "DD011", name: "Đỗ Văn Mạnh", dept: khoaSan.id, phone: "0902000011", level: "Đại học", exp: 6 },
    { code: "DD012", name: "Cao Thị Ngọc", dept: khoaNhi.id, phone: "0902000012", level: "Đại học", exp: 5 },
    { code: "DD013", name: "Tô Văn Phúc", dept: khoaNhi.id, phone: "0902000013", level: "Cao đẳng", exp: 2 },
    { code: "DD014", name: "Hà Thị Quỳnh", dept: phongKham.id, phone: "0902000014", level: "Đại học", exp: 4 },
    { code: "DD015", name: "Lương Văn Sơn", dept: phongKham.id, phone: "0902000015", level: "Đại học", exp: 7 },
  ];

  const nurses = [];
  for (const n of nurseData) {
    const nurse = await prisma.user.create({
      data: {
        employeeCode: n.code,
        name: n.name,
        password: hashedPassword,
        role: "NURSE",
        departmentId: n.dept,
        phone: n.phone,
        position: "Điều dưỡng",
        level: n.level,
        experienceYears: n.exp,
      },
    });
    nurses.push(nurse);
  }

  console.log("✓ Đã tạo 1 admin, 3 trưởng khoa, 15 điều dưỡng");

  // ===== Create Schedules (7 days) =====
  const today = new Date();
  const allStaff = [headNurse1, headNurse2, headNurse3, ...nurses];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    for (const staff of allStaff) {
      const rand = Math.random();
      let shiftType;
      if (rand < 0.2) {
        shiftType = "OFF";
      } else if (rand < 0.6) {
        shiftType = "ADMIN";
      } else {
        shiftType = "DUTY";
      }

      await prisma.schedule.create({
        data: {
          date,
          shiftType,
          userId: staff.id,
          status: "CONFIRMED",
        },
      });
    }
  }

  console.log("✓ Đã tạo lịch trực 7 ngày cho 18 nhân viên");

  // ===== Create Daily Reports (last 7 days) =====
  const departments = [khoaNoi, khoaNgoai, khoaHoiSuc, khoaSan, khoaNhi, phongKham];

  for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    date.setHours(8, 0, 0, 0);

    for (const dept of departments) {
      await prisma.dailyReport.create({
        data: {
          date,
          departmentId: dept.id,
          adminStaff: Math.floor(Math.random() * 5) + 3,
          dutyStaff: Math.floor(Math.random() * 3) + 2,
          leaveStaff: Math.floor(Math.random() * 2),
          totalStaff: 15,
          patientsLevel1: Math.floor(Math.random() * 10) + 5,
          patientsLevel2: Math.floor(Math.random() * 8) + 3,
          patientsLevel3: Math.floor(Math.random() * 5) + 1,
          suggestions: Math.random() > 0.5 ? "Cần bổ sung thêm nhân lực ca đêm" : null,
        },
      });
    }
  }

  console.log("✓ Đã tạo báo cáo hàng ngày (7 ngày × 6 khoa)");

  // ===== Create Announcements =====
  const announcements = [
    { title: "Lịch họp giao ban tháng 4/2026", content: "Kính gửi toàn thể điều dưỡng,\n\nPhòng Điều dưỡng thông báo lịch họp giao ban tháng 4/2026 vào lúc 14h00 ngày 10/04/2026 tại Hội trường A.\n\nĐề nghị các trưởng khoa chuẩn bị báo cáo tình hình nhân lực và nhu cầu đào tạo.\n\nTrân trọng!", isPinned: true },
    { title: "Thông báo lịch đào tạo kỹ năng vô trùng", content: "Phòng Điều dưỡng tổ chức lớp đào tạo kỹ năng vô trùng dành cho toàn bộ điều dưỡng viên.\n\n- Thời gian: 08h00 - 11h30, ngày 15/04/2026\n- Địa điểm: Phòng đào tạo tầng 3\n- Giảng viên: ThS. Lê Văn Minh\n\nĐề nghị các khoa sắp xếp nhân lực để cử đủ người tham gia.", isPinned: true },
    { title: "Kết quả kiểm tra chéo vệ sinh bệnh viện", content: "Kết quả kiểm tra chéo vệ sinh bệnh viện tuần 1 tháng 4/2026:\n\n- Khoa Nội: Đạt (9/10)\n- Khoa Ngoại: Đạt (8.5/10)\n- Khoa HSTC: Đạt (9.5/10)\n- Khoa Sản: Cần cải thiện (7/10)\n\nĐề nghị Khoa Sản khắc phục các vấn đề đã nêu trước đợt kiểm tra tiếp theo.", isPinned: false },
    { title: "Quy trình mới về giao nhận ca trực", content: "Bắt đầu từ ngày 15/04/2026, áp dụng quy trình mới về giao nhận ca trực theo Quyết định số 125/QĐ-BV.\n\nCác điểm mới:\n1. Giao ca phải có sổ ghi chép đầy đủ\n2. Bàn giao thuốc và vật tư phải có đối chiếu\n3. Báo cáo tình trạng bệnh nhân nặng theo mẫu mới\n\nVui lòng liên hệ Phòng Điều dưỡng để nhận mẫu biểu mới.", isPinned: false },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: {
        title: ann.title,
        content: ann.content,
        authorId: admin.id,
        isPinned: ann.isPinned,
      },
    });
  }

  console.log("✓ Đã tạo 4 thông báo");

  console.log("\n========================================");
  console.log("🎉 SEED HOÀN TẤT!");
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

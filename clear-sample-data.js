const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Đang xóa dữ liệu mẫu...");

  try {
    // Xóa các bảng phụ thuộc trước
    await prisma.auditLog.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.dailyReport.deleteMany({});
    await prisma.announcement.deleteMany({});

    // Xóa User (trừ Admin)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN"
        }
      }
    });
    console.log(`✓ Đã xóa ${deletedUsers.count} nhân viên.`);

    // Xóa Department (trừ các khoa cơ bản nếu muốn giữ, hoặc xóa hết)
    // Người dùng nói "xóa hết dữ liệu mẫu", thường bao gồm cả các khoa mẫu
    const deletedDepts = await prisma.department.deleteMany({});
    console.log(`✓ Đã xóa ${deletedDepts.count} khoa/phòng.`);

    console.log("✨ Đã dọn dẹp xong dữ liệu mẫu. Hệ thống đã sẵn sàng cho dữ liệu mới.");
  } catch (error) {
    console.error("❌ Lỗi khi xóa dữ liệu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

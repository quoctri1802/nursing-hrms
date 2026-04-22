require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function reset() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const newPassword = await bcrypt.hash("123456", 10);
    
    console.log("--- ĐANG ĐẶT LẠI MẬT KHẨU ADMIN ---");
    
    const updatedUser = await prisma.user.update({
      where: { employeeCode: "ADMIN001" },
      data: { password: newPassword }
    });

    console.log("✅ THÀNH CÔNG: Mật khẩu của ADMIN001 đã được đổi thành: 123456");
    console.log("Tên quản trị viên:", updatedUser.name);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật mật khẩu:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

reset();

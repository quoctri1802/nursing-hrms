require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

async function cleanup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("--- ĐANG DỌN DẸP DỮ LIỆU EMAIL TRỐNG ---");
    
    // Tìm các user có email là chuỗi rỗng
    const usersWithEmptyEmail = await prisma.user.findMany({
      where: {
        email: ""
      }
    });

    console.log(`Tìm thấy ${usersWithEmptyEmail.length} người dùng có email trống ("").`);

    for (const user of usersWithEmptyEmail) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: null }
      });
      console.log(`- Đã cập nhật User ${user.employeeCode} thành email: null`);
    }

    console.log("✅ Hoàn tất dọn dẹp.");

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

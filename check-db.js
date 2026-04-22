require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("--- ĐANG KIỂM TRA TÀI KHOẢN TRONG DATABASE ---");
    const users = await prisma.user.findMany({
      select: {
        employeeCode: true,
        name: true,
        role: true
      },
      take: 5
    });

    if (users.length === 0) {
      console.log("❌ CẢNH BÁO: Database trống rỗng, chưa có dữ liệu!");
    } else {
      console.log("✅ Tìm thấy " + users.length + " người dùng:");
      console.table(users);
    }
  } catch (err) {
    console.error("❌ Lỗi khi kết nối database:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

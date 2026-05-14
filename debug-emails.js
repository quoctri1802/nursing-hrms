require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("--- KIỂM TRA DỮ LIỆU EMAIL TRONG DATABASE ---");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true
      }
    });

    console.log(`Tìm thấy ${users.length} người dùng.`);
    users.forEach(u => {
      console.log(`ID: ${u.id}, Code: ${u.employeeCode}, Email: [${u.email}] (Type: ${typeof u.email})`);
    });

  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

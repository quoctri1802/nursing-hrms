require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.length);
  users.forEach(u => console.log(`- ${u.employeeCode}: ${u.name} (${u.role})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

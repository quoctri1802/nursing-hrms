require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

async function test() {
  const url = process.env.DATABASE_URL;
  console.log("Testing Pool with DIRECT connection string...");
  
  try {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("Success! Pool connection works:", result);
    await prisma.$disconnect();
  } catch (err) {
    console.error("Pool connection failed even with DIRECT string!");
    console.error(err);
  }
}

test();

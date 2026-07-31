/// <reference types="node" />
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

process.loadEnvFile();

const adapter = new PrismaBetterSqlite3({
  url: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.inventory.deleteMany();
  await prisma.inventory.createMany({
    data: [
      {
        sku: "LAPTOP-001",
        available: 10,
        reserved: 2,
        warehouse: "WH-A",
      },
      {
        sku: "MOUSE-001",
        available: 25,
        reserved: 5,
        warehouse: "WH-A",
      },
      {
        sku: "KEYBOARD-001",
        available: 0,
        reserved: 3,
        warehouse: "WH-B",
      },
    ],
  });

  console.log("✅ Inventory seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
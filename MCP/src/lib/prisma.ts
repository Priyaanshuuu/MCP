import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file present; the check below reports the missing variable.
  }
}

const url = process.env["DATABASE_URL"];

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env or provide it in the environment.",
  );
}

const adapter = new PrismaBetterSqlite3({ url });

const prisma = new PrismaClient({ adapter });

export default prisma;

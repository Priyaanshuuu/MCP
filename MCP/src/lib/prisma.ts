import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { Pool } from "pg";

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

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;

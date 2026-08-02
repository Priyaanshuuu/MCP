/// <reference types="node" />
import { defineConfig } from "prisma/config";

// Render and other hosts inject env vars directly, with no .env file present.
if (!process.env["DATABASE_URL"]) {
  try {
    process.loadEnvFile();
  } catch {
    // No .env present
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

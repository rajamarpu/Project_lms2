import "dotenv/config";
import { defineConfig } from "prisma/config";

const isTestEnv = process.env.NODE_ENV === "test" || process.env.DATABASE_ENV === "test";
const databaseUrl = [
  isTestEnv ? process.env["DATABASE_URL_TEST"] : null,
  process.env["DATABASE_URL"],
  process.env["DATABASE_URL_POOLER"],
  process.env["DATABASE_URL_DIRECT"],
].find((value): value is string => typeof value === "string" && value.trim())?.trim();

if (!databaseUrl) {
  throw new Error(
    isTestEnv
      ? "DATABASE_URL_TEST is missing. Set DATABASE_URL_TEST for Prisma test operations, or DATABASE_URL as a fallback."
      : "DATABASE_URL is missing. Set DATABASE_URL for local or production use, or DATABASE_URL_POOLER / DATABASE_URL_DIRECT for Supabase."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
<<<<<<< HEAD
    url: process.env["DIRECT_DATABASE_URL"] || process.env["DATABASE_URL"],
=======
    url: databaseUrl,
>>>>>>> 3b70a8a (Improved Database setup)
  },
});

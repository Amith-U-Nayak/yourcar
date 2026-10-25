import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

/**
 * Runs once before the entire Jest test suite (separate Node.js context).
 * 1. Loads .env so TEST_DATABASE_URL is available
 * 2. Points DATABASE_URL at the test DB
 * 3. Runs `prisma migrate deploy` — applies all pending migrations
 */
export default async function globalSetup(): Promise<void> {
  // Load env from root .env (two levels up from backend/src/test/)
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

  const testDbUrl = process.env.TEST_DATABASE_URL;
  if (!testDbUrl) {
    throw new Error(
      "[test] TEST_DATABASE_URL is not set. " +
        "Copy .env.example to .env and fill in the test DB URL."
    );
  }

  console.log("[test] Migrating test database...");
  execSync("npx prisma migrate deploy", {
    // Run from the backend directory so Prisma finds schema.prisma
    cwd: path.resolve(__dirname, "../../"),
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl, // override so Prisma hits the test DB
    },
    stdio: "inherit",
  });
  console.log("[test] Test database ready ✓");
}

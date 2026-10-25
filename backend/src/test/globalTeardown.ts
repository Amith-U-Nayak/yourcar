import { PrismaClient } from "@prisma/client";
import path from "path";
import dotenv from "dotenv";

/**
 * Runs once after the entire Jest test suite (separate Node.js context).
 * Disconnects a fresh PrismaClient to flush any lingering connections.
 *
 * Note: globalTeardown runs in a different context than the tests themselves,
 * so we create a new client here rather than importing the shared singleton.
 */
export default async function globalTeardown(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

  const client = new PrismaClient({
    datasources: {
      db: { url: process.env.TEST_DATABASE_URL },
    },
  });

  await client.$disconnect();
  console.log("[test] Global teardown complete ✓");
}

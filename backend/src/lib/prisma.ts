import { PrismaClient } from "@prisma/client";
import { config } from "../config";

/**
 * Singleton PrismaClient.
 *
 * Why singleton? PrismaClient manages a connection pool.
 * Creating one per request would exhaust DB connections quickly.
 *
 * In test mode, DATABASE_URL is already pointed at the test DB
 * by config.ts, so this client automatically hits the right DB.
 */
const prisma = new PrismaClient({
  // Log queries in development for easier debugging
  log: config.nodeEnv === "development" ? ["query", "warn", "error"] : ["error"],
});

export { prisma };

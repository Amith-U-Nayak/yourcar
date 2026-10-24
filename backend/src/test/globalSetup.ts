/**
 * Stub global setup — runs once before the entire Jest test suite.
 * Phase 1 will wire this up to:
 *   1. Run `prisma migrate deploy` against TEST_DATABASE_URL
 *   2. Confirm the DB is reachable
 */
export default async function globalSetup(): Promise<void> {
  console.log("[test] Global setup — test DB ready");
}

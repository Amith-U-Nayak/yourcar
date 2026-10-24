/**
 * Stub global teardown — runs once after the entire Jest test suite.
 * Phase 1 will wire this up to disconnect the Prisma client.
 */
export default async function globalTeardown(): Promise<void> {
  console.log("[test] Global teardown complete");
}

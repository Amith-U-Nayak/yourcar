/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest so Jest understands TypeScript directly — no separate compile step
  preset: "ts-jest",
  testEnvironment: "node",

  // Only run files inside src/ that end in .test.ts
  testMatch: ["<rootDir>/src/**/*.test.ts"],

  // Map @/ imports to src/ (clean absolute imports in tests)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Show each test name while running — great for TDD feedback loops
  verbose: true,

  // Collect coverage from all source files, not just tested ones
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",      // entry point — integration-tested via supertest
    "!src/generated/**",  // Prisma generated code
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Global setup/teardown hooks for the test DB (wired up in Phase 1)
  globalSetup: "./src/test/globalSetup.ts",
  globalTeardown: "./src/test/globalTeardown.ts",
};

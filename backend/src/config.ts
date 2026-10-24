import dotenv from "dotenv";
import path from "path";

// Load the correct .env file.
// In test, Jest sets NODE_ENV=test via cross-env in package.json scripts.
// We point to the root .env so both backend and root-level env files work.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3000", 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // Database — test environment uses its own isolated DB
  databaseUrl:
    process.env.NODE_ENV === "test"
      ? (process.env.TEST_DATABASE_URL ?? "")
      : (process.env.DATABASE_URL ?? ""),
} as const;

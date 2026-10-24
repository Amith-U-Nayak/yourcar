import express from "express";
import cors from "cors";

/**
 * Creates and configures the Express application.
 * Kept separate from index.ts so Supertest can import it
 * without actually starting a server on a port.
 */
export function createApp(): express.Application {
  const app = express();

  // Parse JSON request bodies
  app.use(express.json());

  // Allow requests from the Vite dev server in development
  app.use(cors());

  // ── Health check (no auth required) ─────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "yourcar-api" });
  });

  // ── API routes (wired up in later phases) ────────────────────────────────────
  // app.use("/api/auth", authRouter);
  // app.use("/api/vehicles", vehicleRouter);

  return app;
}

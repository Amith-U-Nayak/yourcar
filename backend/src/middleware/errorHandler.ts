import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { config } from "../config";

/**
 * Global Express error-handling middleware.
 * Must be registered LAST (after all routes) and must have exactly 4 parameters.
 *
 * Two cases:
 *   1. AppError (operational) → return its statusCode and message to the client.
 *   2. Unknown error (bug)    → log it, return a safe 500 message.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Unexpected error — log the real cause server-side, never leak it to the client
  console.error("[UNHANDLED ERROR]", err);

  res.status(500).json({
    status: "error",
    // In development we expose the message for easier debugging;
    // in test + production we always send a safe generic message.
    message:
      config.nodeEnv === "development" ? err.message : "Internal server error",
  });
}

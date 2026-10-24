import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { errorHandler } from "../middleware/errorHandler";

// Helper: build a minimal mock Express Response
function mockResponse() {
  const res = {
    statusCode: 0,
    body: {} as Record<string, unknown>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: Record<string, unknown>) {
      this.body = data;
      return this;
    },
  };
  return res;
}

// ── AppError ─────────────────────────────────────────────────────────────────

describe("AppError", () => {
  it("stores statusCode, message, and isOperational", () => {
    const err = new AppError(404, "Vehicle not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Vehicle not found");
    // isOperational distinguishes expected domain errors from programming bugs
    expect(err.isOperational).toBe(true);
  });

  it("is an instance of Error so it can be thrown and caught normally", () => {
    const err = new AppError(400, "Bad request");
    expect(err).toBeInstanceOf(Error);
  });

  it("captures a stack trace", () => {
    const err = new AppError(500, "Oops");
    expect(err.stack).toBeDefined();
  });
});

// ── errorHandler middleware ───────────────────────────────────────────────────

describe("errorHandler middleware", () => {
  const noop = jest.fn(); // next — should never be called by the handler

  beforeEach(() => jest.clearAllMocks());

  it("responds with AppError's statusCode and message", () => {
    const err = new AppError(409, "Out of stock");
    const res = mockResponse();

    errorHandler(err, {} as Request, res as unknown as Response, noop);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ status: "error", message: "Out of stock" });
    expect(noop).not.toHaveBeenCalled();
  });

  it("responds 422 for validation AppErrors", () => {
    const err = new AppError(422, "mileage is required for USED cars");
    const res = mockResponse();

    errorHandler(err, {} as Request, res as unknown as Response, noop);

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      status: "error",
      message: "mileage is required for USED cars",
    });
  });

  it("responds 500 and hides details for unexpected errors", () => {
    const err = new Error("Cannot read properties of undefined");
    const res = mockResponse();

    errorHandler(err, {} as Request, res as unknown as Response, noop);

    // Status must be 500 and we must NOT leak the internal error message
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ status: "error", message: "Internal server error" });
  });
});

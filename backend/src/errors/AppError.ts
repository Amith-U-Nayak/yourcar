/**
 * AppError — operational (expected) errors in the domain.
 *
 * We distinguish these from programming bugs by the `isOperational` flag.
 * The global error handler shows the message to the client only for operational errors;
 * unexpected errors always return a generic "Internal server error".
 */
export class AppError extends Error {
  public readonly statusCode: number;
  /** True for expected domain errors (404, 409, 422…). False for programming bugs. */
  public readonly isOperational = true;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the call site, not the AppError constructor itself
    Error.captureStackTrace(this, this.constructor);
  }
}

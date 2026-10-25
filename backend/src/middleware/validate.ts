import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../errors/AppError";

/**
 * Middleware factory that validates request body against a given Zod schema.
 * Formats validation issues into a single clean message and passes an AppError(400) to next().
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(", ");
        next(new AppError(400, message));
        return;
      }
      next(error);
    }
  };
}

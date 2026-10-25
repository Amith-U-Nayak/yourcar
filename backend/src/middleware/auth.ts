import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { config } from "../config";
import { AuthUser } from "../types/express";

/**
 * Authentication middleware.
 * Verifies Bearer JWT from Authorization header and sets req.user.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "Authorization token required"));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (_error) {
    next(new AppError(401, "Invalid or expired token"));
  }
}

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user has at least one of the specified allowed roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(403, "Forbidden: insufficient permissions for this action")
      );
      return;
    }

    next();
  };
}

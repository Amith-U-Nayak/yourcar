import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { authenticate, requireRole } from "../middleware/auth";
import { errorHandler } from "../middleware/errorHandler";
import { config } from "../config";
import { Role } from "@prisma/client";

// Minimal Express test app to isolate and test auth middleware
function createAuthTestApp() {
  const app = express();
  app.use(express.json());

  // Protected route for any authenticated user
  app.get("/test/protected", authenticate, (req, res) => {
    res.json({ status: "success", user: req.user });
  });

  // Protected route for ADMIN only
  app.get(
    "/test/admin-only",
    authenticate,
    requireRole(Role.ADMIN),
    (req, res) => {
      res.json({ status: "success", user: req.user });
    }
  );

  app.use(errorHandler);
  return app;
}

describe("Auth Middleware — authenticate & requireRole", () => {
  const testApp = createAuthTestApp();

  const validUserPayload = {
    id: "user-123",
    email: "user@yourcar.com",
    role: Role.USER,
  };

  const validAdminPayload = {
    id: "admin-123",
    email: "admin@yourcar.com",
    role: Role.ADMIN,
  };

  function createToken(payload: object, secret = config.jwtSecret, expiresIn = "1h") {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  describe("authenticate", () => {
    it("allows access when a valid Bearer token is provided", async () => {
      const token = createToken(validUserPayload);

      const res = await request(testApp)
        .get("/test/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject(validUserPayload);
    });

    it("returns 401 when Authorization header is missing", async () => {
      const res = await request(testApp).get("/test/protected");

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/token required|authorization/i);
    });

    it("returns 401 when Authorization header does not use Bearer format", async () => {
      const res = await request(testApp)
        .get("/test/protected")
        .set("Authorization", "Basic 12345");

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
    });

    it("returns 401 when token is invalid or tampered", async () => {
      const invalidToken = createToken(validUserPayload, "wrong_secret");

      const res = await request(testApp)
        .get("/test/protected")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
    });
  });

  describe("requireRole", () => {
    it("allows ADMIN user to access ADMIN route", async () => {
      const adminToken = createToken(validAdminPayload);

      const res = await request(testApp)
        .get("/test/admin-only")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("ADMIN");
    });

    it("returns 403 Forbidden when USER role attempts to access ADMIN route", async () => {
      const userToken = createToken(validUserPayload);

      const res = await request(testApp)
        .get("/test/admin-only")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/forbidden|insufficient/i);
    });

    it("returns 401 when requireRole is evaluated without an authenticated user", async () => {
      const unauthApp = express();
      unauthApp.get("/no-auth", requireRole(Role.ADMIN), (_req, res) => {
        res.json({ ok: true });
      });
      unauthApp.use(errorHandler);

      const res = await request(unauthApp).get("/no-auth");
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/authentication required/i);
    });
  });
});

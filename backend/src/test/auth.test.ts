import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

describe("Auth Module — /api/auth", () => {
  beforeEach(async () => {
    // Clean test database before each test to ensure test isolation
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  describe("POST /api/auth/register", () => {
    it("successfully registers a new user and returns 201 with JWT token and user info (without password)", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@yourcar.com",
          password: "password123",
          role: "USER",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user).toMatchObject({
        email: "test@yourcar.com",
        role: "USER",
      });
      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user).not.toHaveProperty("password");

      // Verify user is persisted in DB with hashed password
      const userInDb = await prisma.user.findUnique({
        where: { email: "test@yourcar.com" },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.password).not.toBe("password123"); // must be bcrypt hashed
    });

    it("defaults to role USER if role is not specified", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "defaultrole@yourcar.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe("USER");
    });

    it("returns 409 Conflict if email is already registered", async () => {
      // Register first time
      await request(app).post("/api/auth/register").send({
        email: "duplicate@yourcar.com",
        password: "password123",
      });

      // Try duplicate
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@yourcar.com",
          password: "password123",
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toMatch(/already registered|already exists/i);
    });

    it("returns 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "not-an-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("returns 400 if password is less than 6 characters", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "shortpw@yourcar.com",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app).post("/api/auth/register").send({
        email: "login@yourcar.com",
        password: "correctpassword",
        role: "ADMIN",
      });
    });

    it("returns 200 with JWT and user data on valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@yourcar.com",
          password: "correctpassword",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user).toMatchObject({
        email: "login@yourcar.com",
        role: "ADMIN",
      });
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    it("returns 401 when email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@yourcar.com",
          password: "correctpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toMatch(/invalid credentials/i);
    });

    it("returns 401 when password is incorrect", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@yourcar.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toMatch(/invalid credentials/i);
    });

    it("returns 400 when missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@yourcar.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });
});

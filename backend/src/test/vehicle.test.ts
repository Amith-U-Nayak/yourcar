import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { Category, Condition, FuelType, Role } from "@prisma/client";

const app = createApp();

describe("Vehicle Module — /api/vehicles", () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Clean database before each test
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create an Admin user and get token
    const adminRes = await request(app).post("/api/auth/register").send({
      email: "admin@yourcar.com",
      password: "password123",
      role: Role.ADMIN,
    });
    adminToken = adminRes.body.data.token;

    // Create a regular User and get token
    const userRes = await request(app).post("/api/auth/register").send({
      email: "user@yourcar.com",
      password: "password123",
      role: Role.USER,
    });
    userToken = userRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
  });

  const validNewVehicle = {
    make: "Tesla",
    model: "Model 3",
    category: Category.EV,
    price: 45000,
    quantity: 5,
    condition: Condition.NEW,
    year: 2024,
    fuelType: FuelType.EV,
    imageUrl: "https://example.com/model3.jpg",
  };

  const validUsedVehicle = {
    make: "Toyota",
    model: "Camry",
    category: Category.SEDAN,
    price: 22000,
    quantity: 1,
    condition: Condition.USED,
    year: 2020,
    fuelType: FuelType.PETROL,
    mileage: 35000,
    ownersCount: 1,
  };

  // ── POST /api/vehicles (Create) ──────────────────────────────────────────

  describe("POST /api/vehicles", () => {
    it("allows ADMIN to create a valid NEW vehicle with batch stock (quantity > 1)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.vehicle).toMatchObject({
        make: "Tesla",
        model: "Model 3",
        category: "EV",
        condition: "NEW",
        quantity: 5,
        year: 2024,
        fuelType: "EV",
      });
      expect(Number(res.body.data.vehicle.price)).toBe(45000);
      expect(res.body.data.vehicle.id).toBeDefined();
    });

    it("allows ADMIN to create a valid USED vehicle with quantity=1, mileage, and ownersCount", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validUsedVehicle);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.vehicle).toMatchObject({
        make: "Toyota",
        model: "Camry",
        category: "SEDAN",
        condition: "USED",
        quantity: 1,
        mileage: 35000,
        ownersCount: 1,
      });
    });

    it("rejects USED vehicle if quantity is greater than 1 (USED cars must be unique: 0 or 1)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUsedVehicle,
          quantity: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/quantity for used vehicles must be 0 or 1/i);
    });

    it("rejects USED vehicle if mileage is missing", async () => {
      const { mileage, ...withoutMileage } = validUsedVehicle;
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(withoutMileage);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/mileage is required for used vehicles/i);
    });

    it("rejects USED vehicle if ownersCount is missing", async () => {
      const { ownersCount, ...withoutOwners } = validUsedVehicle;
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(withoutOwners);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/owners count is required for used vehicles/i);
    });

    it("rejects vehicle creation if unauthenticated (401)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .send(validNewVehicle);

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
    });

    it("rejects vehicle creation if user role is USER (403 Forbidden)", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validNewVehicle);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe("error");
    });
  });

  // ── GET /api/vehicles (List) ─────────────────────────────────────────────

  describe("GET /api/vehicles", () => {
    it("returns 200 with list of vehicles for authenticated users", async () => {
      // Seed two vehicles
      await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validUsedVehicle);

      const res = await request(app)
        .get("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data.vehicles)).toBe(true);
      expect(res.body.data.vehicles.length).toBe(2);
    });

    it("rejects unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/vehicles");
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/vehicles/:id (Detail) ───────────────────────────────────────

  describe("GET /api/vehicles/:id", () => {
    it("returns 200 with vehicle details when vehicle exists", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.vehicle.id).toBe(vehicleId);
      expect(res.body.data.vehicle.make).toBe("Tesla");
    });

    it("returns 404 when vehicle ID does not exist", async () => {
      const res = await request(app)
        .get("/api/vehicles/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/vehicle not found/i);
    });
  });

  // ── PUT /api/vehicles/:id (Update) ───────────────────────────────────────

  describe("PUT /api/vehicles/:id", () => {
    it("allows ADMIN to update vehicle details", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          price: 42000,
          quantity: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Number(res.body.data.vehicle.price)).toBe(42000);
      expect(res.body.data.vehicle.quantity).toBe(8);
    });

    it("rejects update if user role is USER (403)", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 40000 });

      expect(res.status).toBe(403);
    });

    it("returns 404 when updating non-existent vehicle", async () => {
      const res = await request(app)
        .put("/api/vehicles/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: 40000 });

      expect(res.status).toBe(404);
    });

    it("enforces domain rule: cannot update a USED vehicle quantity to > 1", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validUsedVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/quantity for used vehicles must be 0 or 1/i);
    });
  });

  // ── DELETE /api/vehicles/:id (Delete) ────────────────────────────────────

  describe("DELETE /api/vehicles/:id", () => {
    it("allows ADMIN to delete a vehicle (200 / 204)", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 204]).toContain(res.status);

      // Verify it no longer exists
      const getRes = await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it("rejects DELETE if user role is USER (403 Forbidden)", async () => {
      const createRes = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validNewVehicle);

      const vehicleId = createRes.body.data.vehicle.id;

      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("returns 404 when deleting non-existent vehicle", async () => {
      const res = await request(app)
        .delete("/api/vehicles/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});

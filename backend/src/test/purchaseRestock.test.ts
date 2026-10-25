import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { Category, Condition, FuelType, Role } from "@prisma/client";

const app = createApp();

describe("Vehicle Purchase & Restock Module", () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Clear test database
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Register admin user
    const adminRes = await request(app).post("/api/auth/register").send({
      email: "admin@yourcar.com",
      password: "password123",
      role: Role.ADMIN,
    });
    adminToken = adminRes.body.data.token;

    // Register regular user
    const userRes = await request(app).post("/api/auth/register").send({
      email: "buyer@yourcar.com",
      password: "password123",
      role: Role.USER,
    });
    userToken = userRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
  });

  async function createVehicle(overrides: Record<string, unknown> = {}) {
    return prisma.vehicle.create({
      data: {
        make: "Toyota",
        model: "Corolla",
        category: Category.SEDAN,
        price: 20000,
        quantity: 5,
        condition: Condition.NEW,
        year: 2024,
        fuelType: FuelType.PETROL,
        ...overrides,
      },
    });
  }

  // ── POST /api/vehicles/:id/purchase ──────────────────────────────────────

  describe("POST /api/vehicles/:id/purchase", () => {
    it("allows authenticated USER to purchase a NEW vehicle, decrementing quantity by 1", async () => {
      const vehicle = await createVehicle({ quantity: 5, condition: Condition.NEW });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.vehicle.quantity).toBe(4);

      // Verify in DB
      const updated = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(updated?.quantity).toBe(4);
    });

    it("allows purchasing a USED vehicle, decrementing quantity from 1 to 0 (sold out)", async () => {
      const vehicle = await createVehicle({
        quantity: 1,
        condition: Condition.USED,
        mileage: 30000,
        ownersCount: 1,
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle.quantity).toBe(0);

      const updated = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(updated?.quantity).toBe(0);
    });

    it("returns 409 Conflict when attempting to purchase an out-of-stock NEW vehicle (quantity = 0)", async () => {
      const vehicle = await createVehicle({ quantity: 0, condition: Condition.NEW });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/out of stock/i);

      // Quantity must remain 0 (never negative)
      const inDb = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(inDb?.quantity).toBe(0);
    });

    it("returns 409 Conflict when attempting to purchase an already sold USED vehicle (quantity = 0)", async () => {
      const vehicle = await createVehicle({
        quantity: 0,
        condition: Condition.USED,
        mileage: 45000,
        ownersCount: 2,
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/sold out/i);
    });

    it("returns 404 when vehicle ID does not exist", async () => {
      const res = await request(app)
        .post("/api/vehicles/00000000-0000-0000-0000-000000000000/purchase")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("error");
    });

    it("rejects unauthenticated purchase requests with 401", async () => {
      const vehicle = await createVehicle({ quantity: 3 });

      const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);

      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/vehicles/:id/restock ───────────────────────────────────────

  describe("POST /api/vehicles/:id/restock", () => {
    it("allows ADMIN to restock a NEW vehicle by specifying an increment quantity", async () => {
      const vehicle = await createVehicle({ quantity: 2, condition: Condition.NEW });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.vehicle.quantity).toBe(7);

      const inDb = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(inDb?.quantity).toBe(7);
    });

    it("defaults increment to +1 if quantity is omitted in restock body", async () => {
      const vehicle = await createVehicle({ quantity: 2, condition: Condition.NEW });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle.quantity).toBe(3);
    });

    it("allows ADMIN to relist/restock a sold USED vehicle (quantity 0 -> 1)", async () => {
      const vehicle = await createVehicle({
        quantity: 0,
        condition: Condition.USED,
        mileage: 50000,
        ownersCount: 1,
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle.quantity).toBe(1);

      const inDb = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(inDb?.quantity).toBe(1);
    });

    it("rejects restocking a USED vehicle that is already in stock (quantity 1) with 409 Conflict", async () => {
      const vehicle = await createVehicle({
        quantity: 1,
        condition: Condition.USED,
        mileage: 50000,
        ownersCount: 1,
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/already in stock/i);
    });

    it("rejects restocking a USED vehicle with quantity > 1 with 400 Bad Request", async () => {
      const vehicle = await createVehicle({
        quantity: 0,
        condition: Condition.USED,
        mileage: 50000,
        ownersCount: 1,
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toMatch(/quantity 1/i);
    });

    it("rejects restock requests from regular USER role with 403 Forbidden", async () => {
      const vehicle = await createVehicle({ quantity: 2 });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe("error");
    });

    it("rejects unauthenticated restock requests with 401", async () => {
      const vehicle = await createVehicle({ quantity: 2 });

      const res = await request(app).post(`/api/vehicles/${vehicle.id}/restock`);

      expect(res.status).toBe(401);
    });

    it("returns 404 when restocking non-existent vehicle", async () => {
      const res = await request(app)
        .post("/api/vehicles/00000000-0000-0000-0000-000000000000/restock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});

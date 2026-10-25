import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";
import { Category, Condition, FuelType, Role } from "@prisma/client";

const app = createApp();

describe("Vehicle Search Module — GET /api/vehicles/search", () => {
  let userToken: string;

  beforeEach(async () => {
    // Clear test database
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Register user for auth token
    const userRes = await request(app).post("/api/auth/register").send({
      email: "buyer@yourcar.com",
      password: "password123",
      role: Role.USER,
    });
    userToken = userRes.body.data.token;

    // Seed test vehicles representing diverse dealership stock
    await prisma.vehicle.createMany({
      data: [
        {
          make: "Tesla",
          model: "Model 3",
          category: Category.EV,
          price: 45000,
          quantity: 5,
          condition: Condition.NEW,
          year: 2024,
          fuelType: FuelType.EV,
        },
        {
          make: "Tesla",
          model: "Model Y",
          category: Category.SUV,
          price: 52000,
          quantity: 3,
          condition: Condition.NEW,
          year: 2023,
          fuelType: FuelType.EV,
        },
        {
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
        },
        {
          make: "Toyota",
          model: "RAV4",
          category: Category.SUV,
          price: 28000,
          quantity: 1,
          condition: Condition.USED,
          year: 2021,
          fuelType: FuelType.HYBRID,
          mileage: 24000,
          ownersCount: 1,
        },
        {
          make: "Ford",
          model: "F-150",
          category: Category.TRUCK,
          price: 38000,
          quantity: 2,
          condition: Condition.NEW,
          year: 2022,
          fuelType: FuelType.DIESEL,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
  });

  it("returns all 5 vehicles when no query parameters are provided", async () => {
    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.vehicles.length).toBe(5);
  });

  it("filters by make with case-insensitive partial match", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=tes")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
    expect(res.body.data.vehicles.every((v: any) => v.make === "Tesla")).toBe(true);
  });

  it("filters by model with case-insensitive partial match", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?model=model")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
  });

  it("filters by category exact match", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?category=SUV")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
    expect(res.body.data.vehicles.every((v: any) => v.category === "SUV")).toBe(true);
  });

  it("filters by price range (minPrice and maxPrice)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?minPrice=25000&maxPrice=40000")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    // Toyota RAV4 (28000) and Ford F-150 (38000)
    expect(res.body.data.vehicles.length).toBe(2);
    const models = res.body.data.vehicles.map((v: any) => v.model);
    expect(models).toContain("RAV4");
    expect(models).toContain("F-150");
  });

  it("filters by condition (NEW vs USED)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?condition=USED")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
    expect(res.body.data.vehicles.every((v: any) => v.condition === "USED")).toBe(true);
  });

  it("filters by fuelType", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?fuelType=EV")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
    expect(res.body.data.vehicles.every((v: any) => v.fuelType === "EV")).toBe(true);
  });

  it("filters by year range (minYear and maxYear)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?minYear=2023&maxYear=2024")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(2);
  });

  it("combines multiple filters correctly (AND logic)", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=Toyota&condition=USED&category=SUV")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles.length).toBe(1);
    expect(res.body.data.vehicles[0].model).toBe("RAV4");
  });

  it("returns empty list when no vehicles match criteria", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=Ferrari")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toEqual([]);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/vehicles/search");
    expect(res.status).toBe(401);
  });
});

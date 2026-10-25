import { PrismaClient, Role, Condition, FuelType, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Yourcar database...");

  // 1. Seed Users
  const adminPassword = await bcrypt.hash("AdminPass123!", 10);
  const userPassword = await bcrypt.hash("CustomerPass123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@yourcar.com" },
    update: {},
    create: {
      email: "admin@yourcar.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@yourcar.com" },
    update: {},
    create: {
      email: "customer@yourcar.com",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log(`✅ Seeded users: ${admin.email} (ADMIN), ${customer.email} (USER)`);

  // 2. Seed Vehicles (Clear existing test vehicles or re-seed)
  await prisma.vehicle.deleteMany({});

  const vehiclesData = [
    {
      make: "Porsche",
      model: "911 GT3",
      category: Category.COUPE,
      price: 224900.0,
      quantity: 3,
      condition: Condition.NEW,
      year: 2024,
      fuelType: FuelType.PETROL,
      imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80",
      modelUrl: "/models/sample-car.glb",
    },
    {
      make: "Tesla",
      model: "Model S Plaid",
      category: Category.SEDAN,
      price: 89990.0,
      quantity: 5,
      condition: Condition.NEW,
      year: 2024,
      fuelType: FuelType.EV,
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80",
      modelUrl: "/models/sample-car.glb",
    },
    {
      make: "BMW",
      model: "X5 xDrive45e",
      category: Category.SUV,
      price: 73500.0,
      quantity: 4,
      condition: Condition.NEW,
      year: 2024,
      fuelType: FuelType.HYBRID,
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Ford",
      model: "F-150 Lightning",
      category: Category.TRUCK,
      price: 62995.0,
      quantity: 2,
      condition: Condition.NEW,
      year: 2024,
      fuelType: FuelType.EV,
      imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Volkswagen",
      model: "Golf R",
      category: Category.HATCHBACK,
      price: 45450.0,
      quantity: 0, // Intentionally out of stock to demonstrate out-of-stock badge & restock flow
      condition: Condition.NEW,
      year: 2024,
      fuelType: FuelType.PETROL,
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Mercedes-Benz",
      model: "C300 4MATIC",
      category: Category.SEDAN,
      price: 34500.0,
      quantity: 1,
      condition: Condition.USED,
      year: 2021,
      fuelType: FuelType.PETROL,
      mileage: 28500,
      ownersCount: 1,
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80",
      modelUrl: "/models/sample-car.glb",
    },
    {
      make: "Audi",
      model: "Q7 55 TFSI Quattro",
      category: Category.SUV,
      price: 41200.0,
      quantity: 1,
      condition: Condition.USED,
      year: 2020,
      fuelType: FuelType.DIESEL,
      mileage: 46200,
      ownersCount: 2,
      imageUrl: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Toyota",
      model: "RAV4 Prime XSE",
      category: Category.SUV,
      price: 36800.0,
      quantity: 1,
      condition: Condition.USED,
      year: 2022,
      fuelType: FuelType.HYBRID,
      mileage: 19800,
      ownersCount: 1,
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Chevrolet",
      model: "Silverado 1500 RST",
      category: Category.TRUCK,
      price: 29900.0,
      quantity: 0, // Intentionally sold out to demonstrate USED relist flow
      condition: Condition.USED,
      year: 2019,
      fuelType: FuelType.PETROL,
      mileage: 62000,
      ownersCount: 2,
      imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop&q=80",
    },
    {
      make: "Mini",
      model: "Cooper S Hardtop",
      category: Category.HATCHBACK,
      price: 23400.0,
      quantity: 1,
      condition: Condition.USED,
      year: 2021,
      fuelType: FuelType.PETROL,
      mileage: 31000,
      ownersCount: 1,
      imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const item of vehiclesData) {
    await prisma.vehicle.create({
      data: item,
    });
  }

  console.log(`✅ Seeded ${vehiclesData.length} vehicles.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

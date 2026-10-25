import { Vehicle, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { VehicleSearchFilters } from "../validators/vehicle.validator";

export class VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {};

    if (filters.make) {
      where.make = { contains: filters.make, mode: "insensitive" };
    }
    if (filters.model) {
      where.model = { contains: filters.model, mode: "insensitive" };
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.condition) {
      where.condition = filters.condition;
    }
    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      where.year = {};
      if (filters.minYear !== undefined) {
        where.year.gte = filters.minYear;
      }
      if (filters.maxYear !== undefined) {
        where.year.lte = filters.maxYear;
      }
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.VehicleCreateInput): Promise<Vehicle> {
    return prisma.vehicle.create({
      data,
    });
  }

  async update(id: string, data: Prisma.VehicleUpdateInput): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({
      where: { id },
    });
  }
}

export const vehicleRepository = new VehicleRepository();

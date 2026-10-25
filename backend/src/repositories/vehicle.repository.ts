import { Vehicle, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
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

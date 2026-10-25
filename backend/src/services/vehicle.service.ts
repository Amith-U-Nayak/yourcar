import { Condition, Vehicle } from "@prisma/client";
import {
  vehicleRepository,
  VehicleRepository,
} from "../repositories/vehicle.repository";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleSearchFilters,
} from "../validators/vehicle.validator";
import { AppError } from "../errors/AppError";

export class VehicleService {
  constructor(private vehicleRepo: VehicleRepository = vehicleRepository) {}

  async create(data: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicleRepo.create({
      make: data.make,
      model: data.model,
      category: data.category,
      price: data.price,
      quantity: data.quantity,
      condition: data.condition,
      year: data.year,
      fuelType: data.fuelType,
      imageUrl: data.imageUrl ?? null,
      modelUrl: data.modelUrl ?? null,
      mileage: data.mileage ?? null,
      ownersCount: data.ownersCount ?? null,
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepo.findAll();
  }

  async search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    return this.vehicleRepo.search(filters);
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findById(id);
    if (!vehicle) {
      throw new AppError(404, "Vehicle not found");
    }
    return vehicle;
  }

  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    const existing = await this.findById(id);

    // Determine target condition (updated condition or existing)
    const effectiveCondition = data.condition ?? existing.condition;

    // Check USED car quantity constraint
    if (effectiveCondition === Condition.USED && data.quantity !== undefined && data.quantity > 1) {
      throw new AppError(400, "Quantity for used vehicles must be 0 or 1");
    }

    return this.vehicleRepo.update(id, {
      ...data,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      modelUrl: data.modelUrl !== undefined ? data.modelUrl : undefined,
      mileage: data.mileage !== undefined ? data.mileage : undefined,
      ownersCount: data.ownersCount !== undefined ? data.ownersCount : undefined,
    });
  }

  async delete(id: string): Promise<Vehicle> {
    await this.findById(id); // Throws 404 if not found
    return this.vehicleRepo.delete(id);
  }
}

export const vehicleService = new VehicleService();

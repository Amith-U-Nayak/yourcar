import { z } from "zod";
import { Category, Condition, FuelType } from "@prisma/client";

export const createVehicleSchema = z
  .object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    category: z.nativeEnum(Category, {
      errorMap: () => ({ message: "Invalid category" }),
    }),
    price: z.number().positive("Price must be a positive number"),
    quantity: z.number().int().min(0, "Quantity cannot be negative").default(1),
    condition: z.nativeEnum(Condition).default(Condition.NEW),
    year: z
      .number()
      .int()
      .min(1900, "Year must be at least 1900")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
    fuelType: z.nativeEnum(FuelType, {
      errorMap: () => ({ message: "Invalid fuel type" }),
    }),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    modelUrl: z.string().url("Invalid 3D model URL").optional().nullable(),
    mileage: z.number().int().min(0, "Mileage cannot be negative").optional().nullable(),
    ownersCount: z.number().int().min(0, "Owners count cannot be negative").optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.condition === Condition.USED) {
      if (data.quantity > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity for used vehicles must be 0 or 1",
          path: ["quantity"],
        });
      }
      if (data.mileage === undefined || data.mileage === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mileage is required for used vehicles",
          path: ["mileage"],
        });
      }
      if (data.ownersCount === undefined || data.ownersCount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Owners count is required for used vehicles",
          path: ["ownersCount"],
        });
      }
    }
  });

export const updateVehicleSchema = z
  .object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    category: z.nativeEnum(Category).optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().min(0).optional(),
    condition: z.nativeEnum(Condition).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    fuelType: z.nativeEnum(FuelType).optional(),
    imageUrl: z.string().url().optional().nullable(),
    modelUrl: z.string().url().optional().nullable(),
    mileage: z.number().int().min(0).optional().nullable(),
    ownersCount: z.number().int().min(0).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.condition === Condition.USED && data.quantity !== undefined && data.quantity > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity for used vehicles must be 0 or 1",
        path: ["quantity"],
      });
    }
  });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export const searchVehicleQuerySchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.nativeEnum(Category).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  condition: z.nativeEnum(Condition).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  minYear: z.coerce.number().int().min(1900).optional(),
  maxYear: z.coerce.number().int().min(1900).optional(),
});

export type VehicleSearchFilters = z.infer<typeof searchVehicleQuerySchema>;

export const restockVehicleSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Restock quantity must be positive")
    .optional()
    .default(1),
});

export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;



import { Router } from "express";
import { vehicleController } from "../controllers/vehicle.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createVehicleSchema,
  updateVehicleSchema,
  restockVehicleSchema,
} from "../validators/vehicle.validator";
import { Role } from "@prisma/client";

const router = Router();

// All vehicle endpoints require authentication
router.use(authenticate);

// Protected routes (Both USER and ADMIN)
router.get("/search", vehicleController.search);
router.get("/", vehicleController.getAll);
router.get("/:id", vehicleController.getById);

// Purchase route (Both USER and ADMIN)
router.post("/:id/purchase", vehicleController.purchase);

// Admin-only routes
router.post(
  "/",
  requireRole(Role.ADMIN),
  validate(createVehicleSchema),
  vehicleController.create
);

router.put(
  "/:id",
  requireRole(Role.ADMIN),
  validate(updateVehicleSchema),
  vehicleController.update
);

router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  vehicleController.delete
);

router.post(
  "/:id/restock",
  requireRole(Role.ADMIN),
  validate(restockVehicleSchema),
  vehicleController.restock
);

export { router as vehicleRouter };

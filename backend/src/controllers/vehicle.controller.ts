import { Request, Response, NextFunction } from "express";
import { vehicleService, VehicleService } from "../services/vehicle.service";

export class VehicleController {
  constructor(private service: VehicleService = vehicleService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const vehicle = await this.service.create(req.body);
      res.status(201).json({
        status: "success",
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const vehicles = await this.service.findAll();
      res.status(200).json({
        status: "success",
        data: { vehicles },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const vehicle = await this.service.findById(id);
      res.status(200).json({
        status: "success",
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const vehicle = await this.service.update(id, req.body);
      res.status(200).json({
        status: "success",
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.service.delete(id);
      res.status(200).json({
        status: "success",
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const vehicleController = new VehicleController();

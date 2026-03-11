import { Request, Response, NextFunction } from 'express';
import * as MaintenanceService from '../services/maintenance';

export async function getMaintenance(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await MaintenanceService.getMaintenanceByUnit(req.query.unitId as string);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createMaintenance(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await MaintenanceService.createMaintenance(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateMaintenance(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await MaintenanceService.updateMaintenance(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

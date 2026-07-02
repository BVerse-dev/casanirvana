import { Request, Response, NextFunction } from 'express';
import * as UnitService from '../services/unit';

export async function getUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const units = await UnitService.getUnitsBySociety(req.params.id);
    res.json(units);
  } catch (error) {
    next(error);
  }
}

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const unit = await UnitService.createUnit(req.params.id, req.body);
    res.status(201).json(unit);
  } catch (error) {
    next(error);
  }
}

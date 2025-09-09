import { Request, Response } from 'express';
import * as UnitService from '../services/unit';

export async function getUnits(req: Request, res: Response) {
  try {
    const units = await UnitService.getUnitsBySociety(req.params.id);
    res.json(units);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createUnit(req: Request, res: Response) {
  try {
    const unit = await UnitService.createUnit(req.params.id, req.body);
    res.status(201).json(unit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

import { Request, Response, NextFunction } from 'express';
import * as VisitorService from '../services/visitor';

export async function createVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const pass = await VisitorService.createVisitorPass(req.body);
    res.status(201).json(pass);
  } catch (error) {
    next(error);
  }
}

export async function getVisitorPasses(req: Request, res: Response, next: NextFunction) {
  try {
    const passes = await VisitorService.getVisitorPassesByUnit(req.query.unitId as string);
    res.json(passes);
  } catch (error) {
    next(error);
  }
}

export async function getPendingVisitorPasses(req: Request, res: Response, next: NextFunction) {
  try {
    const passes = await VisitorService.getPendingVisitorPasses();
    res.json(passes);
  } catch (error) {
    next(error);
  }
}

export async function approveVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const pass = await VisitorService.updateVisitorPassStatus(req.params.id, 'approved');
    res.json(pass);
  } catch (error) {
    next(error);
  }
}

export async function rejectVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const pass = await VisitorService.updateVisitorPassStatus(req.params.id, 'rejected');
    res.json(pass);
  } catch (error) {
    next(error);
  }
}

export async function createEntryLog(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await VisitorService.createEntryLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
}

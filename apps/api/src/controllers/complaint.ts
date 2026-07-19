import { Request, Response, NextFunction } from 'express';
import * as ComplaintService from '../services/complaint';

export async function getComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await ComplaintService.getComplaintsByUnit(req.query.unitId as string);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await ComplaintService.createComplaint(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await ComplaintService.updateComplaint(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    await ComplaintService.deleteComplaint(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

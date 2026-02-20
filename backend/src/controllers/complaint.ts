import { Request, Response } from 'express';
import * as ComplaintService from '../services/complaint';

export function getComplaints(req: Request, res: Response, next: Function) {
  ComplaintService.getComplaintsByUnit(req.query.unitId as string)
    .then(items => res.json(items))
    .catch((error: any) => res.status(500).json({ error: error.message }));
}

export function createComplaint(req: Request, res: Response, next: Function) {
  ComplaintService.createComplaint(req.body)
    .then(item => res.status(201).json(item))
    .catch((error: any) => res.status(500).json({ error: error.message }));
}

export function updateComplaint(req: Request, res: Response, next: Function) {
  ComplaintService.updateComplaint(req.params.id, req.body)
    .then(item => res.json(item))
    .catch((error: any) => res.status(500).json({ error: error.message }));
}

export function deleteComplaint(req: Request, res: Response, next: Function) {
  ComplaintService.deleteComplaint(req.params.id)
    .then(() => res.status(204).send())
    .catch((error: any) => res.status(500).json({ error: error.message }));
}

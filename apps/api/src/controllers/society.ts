import { Request, Response, NextFunction } from 'express';
import * as SocietyService from '../services/society';
import { createHttpError } from '../lib/httpError';

/**
 * Get all societies with filtering and pagination
 */
export async function getSocieties(req: Request, res: Response, next: NextFunction) {
  try {
    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: req.query.sortBy as string || 'created_at',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      search: req.query.search as string,
      type: req.query.type as string
    };

    const societies = await SocietyService.getAllSocieties(options);
    res.json(societies);
  } catch (error) {
    next(error);
  }
}

/**
 * Get society by ID with related data
 */
export async function getSocietyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const society = await SocietyService.getSocietyById(id);

    if (!society) {
      return next(createHttpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found'));
    }

    res.json(society);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new society
 */
export async function createSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const society = await SocietyService.createSociety(req.body);
    res.status(201).json(society);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing society
 */
export async function updateSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updatedSociety = await SocietyService.updateSociety(id, req.body);
    res.json(updatedSociety);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a society
 */
export async function deleteSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await SocietyService.deleteSociety(id);
    res.json({ id, success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Get society statistics
 */
export async function getSocietyStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await SocietyService.getSocietyStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

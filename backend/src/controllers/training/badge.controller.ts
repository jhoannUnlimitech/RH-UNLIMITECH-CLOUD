import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { badgeService } from '../../services/training/badge.service';

/**
 * BadgeController — Manejo HTTP para insignias de Training.
 */

export const getBadges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const badges = await badgeService.getAll({ active });
    res.json({ success: true, data: badges });
  } catch (error) { next(error); }
};

export const getBadgeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const badge = await badgeService.getById(req.params.id as string);
    res.json({ success: true, data: badge });
  } catch (error) { next(error); }
};

export const createBadge = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const badge = await badgeService.create(req.body);
    res.status(201).json({ success: true, data: badge, message: 'Insignia creada exitosamente' });
  } catch (error) { next(error); }
};

export const updateBadge = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const badge = await badgeService.update(req.params.id as string, req.body);
    res.json({ success: true, data: badge, message: 'Insignia actualizada exitosamente' });
  } catch (error) { next(error); }
};

export const deleteBadge = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await badgeService.delete(req.params.id as string);
    res.json({ success: true, message: 'Insignia eliminada exitosamente' });
  } catch (error) { next(error); }
};

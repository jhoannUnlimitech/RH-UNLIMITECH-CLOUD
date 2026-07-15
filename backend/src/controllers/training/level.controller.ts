import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { levelService } from '../../services/training/level.service';

/**
 * LevelController — Manejo HTTP para niveles de Training.
 */

export const getLevels = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const badge = req.query.badge as string | undefined;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const levels = badge ? await levelService.getByBadge(badge) : await levelService.getAll({ active });
    res.json({ success: true, data: levels });
  } catch (error) { next(error); }
};

export const getLevelById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const level = await levelService.getById(req.params.id as string);
    res.json({ success: true, data: level });
  } catch (error) { next(error); }
};

export const createLevel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const level = await levelService.create(req.body);
    res.status(201).json({ success: true, data: level, message: 'Nivel creado exitosamente' });
  } catch (error) { next(error); }
};

export const updateLevel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const level = await levelService.update(req.params.id as string, req.body);
    res.json({ success: true, data: level, message: 'Nivel actualizado exitosamente' });
  } catch (error) { next(error); }
};

export const reorderLevels = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await levelService.reorder(req.body.levels);
    res.json({ success: true, message: 'Niveles reordenados exitosamente' });
  } catch (error) { next(error); }
};

export const deleteLevel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await levelService.delete(req.params.id as string);
    res.json({ success: true, message: 'Nivel eliminado exitosamente' });
  } catch (error) { next(error); }
};

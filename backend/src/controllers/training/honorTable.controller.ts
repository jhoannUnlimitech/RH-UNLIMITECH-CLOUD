import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { honorTableService } from '../../services/training/honorTable.service';

/**
 * HonorTableController — Tabla de Honor trimestral.
 */

/** GET /api/v1/training/honor-table/current — Trimestre actual */
export const getCurrentHonorTable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await honorTableService.getCurrentHonorTable();
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/honor-table/:year/:quarter — Trimestre específico */
export const getHonorTable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year, quarter } = req.params;
    const result = await honorTableService.getHonorTable(Number(quarter), Number(year));
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

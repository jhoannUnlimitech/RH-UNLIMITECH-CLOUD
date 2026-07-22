import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { progressService } from '../../services/training/progress.service';

/**
 * Progress Controller — Endpoints HTTP para progreso de capacitación.
 */

/** GET /api/v1/training/progress/me */
export const getMyProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const progress = await progressService.getByEmployee(req.user!.id);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/training/progress/:employeeId */
export const getProgressByEmployee = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const progress = await progressService.getByEmployee(employeeId);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

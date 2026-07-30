import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { dashboardService } from '../../services/training/dashboard.service';

/**
 * DashboardController — Métricas y alertas del módulo Training.
 */

/** GET /api/v1/training/dashboard/overview */
export const getOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getOverview();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/dashboard/by-level */
export const getLevelDistribution = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getLevelDistribution();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/dashboard/study-hours */
export const getWeeklyStudyHours = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getWeeklyStudyHours();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/dashboard/alerts */
export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getAlerts();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/dashboard/employee/:id */
export const getEmployeeDetail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getEmployeeDetail(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

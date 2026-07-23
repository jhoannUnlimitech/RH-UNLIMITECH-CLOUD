import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { studyReportService } from '../../services/training/studyReport.service';

/** POST /api/v1/training/study-reports */
export const createReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await studyReportService.createOrUpdate(req.user!.id, req.body);
    res.status(201).json({ success: true, data: report, message: 'Reporte guardado' });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/study-reports/me */
export const getMyReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await studyReportService.getMyWeekReports(req.user!.id);
    const weeklyTotal = await studyReportService.getWeeklyTotal(req.user!.id);
    res.json({ success: true, data: reports, weeklyTotal });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/study-reports/attendance */
export const getAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { week } = req.query;
    const attendance = await studyReportService.getWeeklyAttendance(week as string);
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
};

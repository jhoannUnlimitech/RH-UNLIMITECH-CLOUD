import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { attendanceService } from '../../services/training/attendance.service';

/**
 * AttendanceController — Pase de lista manual de estudio.
 */

/** GET /api/v1/training/attendance — Obtener asistencia semanal */
export const getWeeklyAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { week } = req.query;
    const result = await attendanceService.getWeeklyAttendance(week as string);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/attendance/bulk — Marcar asistencia en bulk */
export const markBulk = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await attendanceService.markBulk(req.user!.id, req.body);
    res.status(200).json({ success: true, data: records, message: 'Asistencia registrada' });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/attendance/mark — Marcar asistencia individual */
export const markOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employee, date, present, notes } = req.body;
    const record = await attendanceService.markOne(req.user!.id, employee, date, present, notes);
    res.status(200).json({ success: true, data: record });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/attendance/exempt — Marcar exención (vacaciones, permiso, etc.) */
export const markExempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employee, date, reason } = req.body;
    const record = await attendanceService.markExempt(req.user!.id, employee, date, reason);
    res.status(200).json({ success: true, data: record, message: 'Exención registrada' });
  } catch (error) { next(error); }
};

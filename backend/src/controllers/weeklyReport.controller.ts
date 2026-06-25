import { Response, NextFunction } from 'express';
import { WeeklyReport } from '../models/WeeklyReport';
import { AuthRequest } from '../middleware/auth';

/**
 * Obtener mis reportes semanales (últimas 8 semanas)
 */
export const getMyReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await WeeklyReport.find({ employeeId: req.user!.id })
      .sort({ weekStart: -1 })
      .limit(8);

    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
};

/**
 * Obtener reportes de un empleado específico (para managers)
 */
export const getEmployeeReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const reports = await WeeklyReport.find({ employeeId })
      .sort({ weekStart: -1 })
      .limit(8);

    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
};

/**
 * Obtener reportes del equipo de una división
 */
export const getDivisionReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { divisionId } = req.params;
    const Employee = require('../models/Employee').Employee;
    
    const employees = await Employee.find({ division: divisionId }).select('_id');
    const employeeIds = employees.map((e: any) => e._id);

    const reports = await WeeklyReport.find({
      employeeId: { $in: employeeIds },
      weekStart: { $gte: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) }
    })
      .populate('employeeId', 'name email')
      .sort({ weekStart: -1 });

    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
};

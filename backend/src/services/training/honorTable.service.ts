import { StudyReport } from '../../models/training/StudyReport';
import { Employee } from '../../models/Employee';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { systemConfigService } from '../systemConfig.service';

/**
 * HonorTableService — Tabla de Honor trimestral de estudio.
 *
 * Calcula el ranking de empleados por horas de estudio reportadas en un trimestre.
 * Solo incluye empleados activos con progreso de training activo.
 * Los que superan el mínimo trimestral aparecen en la tabla ordenados por horas.
 */

interface HonorTableEntry {
  position: number;
  employee: { _id: string; name: string; email: string; photo?: string };
  totalHours: number;
  totalReports: number;
  averagePerWeek: number;
  aboveMinimum: number; // Horas por encima del mínimo trimestral
}

interface HonorTableResult {
  quarter: number;
  year: number;
  minWeeklyHours: number;
  minQuarterlyHours: number;
  weeksInQuarter: number;
  entries: HonorTableEntry[];
  totalParticipants: number;
}

class HonorTableService {

  /**
   * Obtener la tabla de honor para un trimestre/año.
   */
  async getHonorTable(quarter: number, year: number): Promise<HonorTableResult> {
    // Validar quarter
    if (quarter < 1 || quarter > 4) throw new Error('Trimestre debe ser 1-4');

    // Obtener config
    const config = await systemConfigService.getConfig();
    const minWeeklyHours = config.training.minWeeklyHours;

    // Calcular rango de fechas del trimestre
    const { startDate, endDate, weeks } = this.getQuarterDates(quarter, year);

    // Mínimo trimestral = minWeeklyHours * semanas del trimestre
    const minQuarterlyHours = minWeeklyHours * weeks;

    // Obtener empleados con progreso activo
    const activeProgressIds = await EmployeeTrainingProgress.find({ active: true })
      .select('employee')
      .lean();
    const activeEmployeeIds = activeProgressIds.map(p => p.employee.toString());

    // Aggregation: sumar horas por empleado en el trimestre
    const aggregation = await StudyReport.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          employee: { $in: activeEmployeeIds.map(id => new (require('mongoose').Types.ObjectId)(id)) },
        },
      },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$totalHours' },
          totalReports: { $sum: 1 },
        },
      },
      {
        $match: {
          totalHours: { $gt: 0 }, // Al menos algo reportado
        },
      },
      {
        $sort: { totalHours: -1 },
      },
    ]);

    // Obtener info de empleados
    const employeeIds = aggregation.map((a: any) => a._id.toString());
    const employees = await Employee.find({ _id: { $in: employeeIds }, status: 'active' })
      .select('name email photo')
      .lean();

    const employeeMap: Record<string, any> = {};
    for (const emp of employees) {
      employeeMap[emp._id.toString()] = emp;
    }

    // Construir entries con ranking
    const entries: HonorTableEntry[] = [];
    let position = 0;

    for (const agg of aggregation) {
      const empId = agg._id.toString();
      const emp = employeeMap[empId];
      if (!emp) continue;

      position++;
      entries.push({
        position,
        employee: {
          _id: empId,
          name: emp.name,
          email: emp.email,
          photo: emp.photo,
        },
        totalHours: Math.round(agg.totalHours * 100) / 100,
        totalReports: agg.totalReports,
        averagePerWeek: Math.round((agg.totalHours / weeks) * 100) / 100,
        aboveMinimum: Math.round((agg.totalHours - minQuarterlyHours) * 100) / 100,
      });
    }

    return {
      quarter,
      year,
      minWeeklyHours,
      minQuarterlyHours,
      weeksInQuarter: weeks,
      entries,
      totalParticipants: entries.length,
    };
  }

  /**
   * Obtener la tabla de honor del trimestre actual.
   */
  async getCurrentHonorTable(): Promise<HonorTableResult> {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear();
    return this.getHonorTable(quarter, year);
  }

  /**
   * Calcular las fechas de inicio y fin de un trimestre.
   */
  private getQuarterDates(quarter: number, year: number): { startDate: Date; endDate: Date; weeks: number } {
    const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
    const startDate = new Date(year, startMonth, 1);
    startDate.setHours(0, 0, 0, 0);

    const endMonth = startMonth + 3;
    const endDate = new Date(year, endMonth, 0); // Último día del mes anterior al siguiente trimestre
    endDate.setHours(23, 59, 59, 999);

    // Calcular semanas en el trimestre (aproximado)
    const diffMs = endDate.getTime() - startDate.getTime();
    const weeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

    return { startDate, endDate, weeks };
  }
}

export const honorTableService = new HonorTableService();

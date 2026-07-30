import { Employee } from '../../models/Employee';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { StudyReport } from '../../models/training/StudyReport';
import { ExamAttempt } from '../../models/training/ExamAttempt';
import { Level } from '../../models/training/Level';
import { BonusRecord } from '../../models/training/BonusRecord';
import { systemConfigService } from '../systemConfig.service';

/**
 * DashboardService — Métricas y alertas del módulo Training para el admin.
 *
 * Provee los datos para el dashboard del encargado de training:
 * - Overview: KPIs principales
 * - Distribución por nivel
 * - Horas de estudio por semana
 * - Alertas accionables
 */

interface DashboardOverview {
  totalEmployeesInTraining: number;
  totalStudyHoursThisQuarter: number;
  averageStudyHoursPerEmployee: number;
  examPassRate: number;
  employeesWithoutReportThisWeek: number;
  pendingEvaluations: number;
  pendingBonuses: number;
  completedLevelsThisMonth: number;
}

interface LevelDistribution {
  levelName: string;
  levelId: string;
  count: number;
  percentage: number;
}

interface WeeklyStudyHours {
  week: string; // "2026-W30"
  totalHours: number;
  reportCount: number;
}

interface DashboardAlert {
  type: 'pending_evaluation' | 'no_report' | 'stalled' | 'pending_bonus' | 'failed_exam';
  severity: 'high' | 'medium' | 'low';
  message: string;
  count: number;
  data?: any[];
}

class DashboardService {

  /**
   * Overview — KPIs principales del dashboard.
   */
  async getOverview(): Promise<DashboardOverview> {
    // Total empleados con progreso activo
    const totalEmployees = await EmployeeTrainingProgress.countDocuments({ active: true });

    // Horas del trimestre actual
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const studyReports = await StudyReport.find({ date: { $gte: quarterStart } });
    const totalHours = studyReports.reduce((sum, r) => sum + r.totalHours, 0);
    const avgHours = totalEmployees > 0 ? Math.round((totalHours / totalEmployees) * 10) / 10 : 0;

    // Tasa de aprobación de exámenes
    const allAttempts = await ExamAttempt.countDocuments({ status: { $in: ['passed', 'failed'] } });
    const passedAttempts = await ExamAttempt.countDocuments({ status: 'passed' });
    const examPassRate = allAttempts > 0 ? Math.round((passedAttempts / allAttempts) * 100) : 0;

    // Empleados sin reporte esta semana
    const config = await systemConfigService.getConfig();
    const studyDays = config.schedule.studyDays;
    const weekStart = this.getWeekStart(now);
    const weekReporters = await StudyReport.distinct('employee', { date: { $gte: weekStart } });
    const employeesWithoutReport = totalEmployees - weekReporters.length;

    // Evaluaciones pendientes
    const pendingEvals = await ExamAttempt.countDocuments({ status: 'pending_evaluation' });

    // Bonos pendientes
    const pendingBonuses = await BonusRecord.countDocuments({ status: 'pending' });

    // Niveles completados este mes
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedLevels = await EmployeeTrainingProgress.aggregate([
      { $unwind: '$levels' },
      { $match: { 'levels.status': 'completed', 'levels.completedAt': { $gte: monthStart } } },
      { $count: 'total' },
    ]);

    return {
      totalEmployeesInTraining: totalEmployees,
      totalStudyHoursThisQuarter: Math.round(totalHours * 10) / 10,
      averageStudyHoursPerEmployee: avgHours,
      examPassRate,
      employeesWithoutReportThisWeek: Math.max(0, employeesWithoutReport),
      pendingEvaluations: pendingEvals,
      pendingBonuses,
      completedLevelsThisMonth: completedLevels[0]?.total || 0,
    };
  }

  /**
   * Distribución de empleados por nivel actual.
   */
  async getLevelDistribution(): Promise<LevelDistribution[]> {
    const allProgress = await EmployeeTrainingProgress.find({ active: true })
      .select('currentLevel')
      .populate('currentLevel', 'name')
      .lean();

    const counts: Record<string, { name: string; count: number }> = {};
    for (const p of allProgress) {
      const level = p.currentLevel as any;
      if (!level) continue;
      const id = level._id?.toString() || 'none';
      const name = level.name || 'Sin nivel';
      if (!counts[id]) counts[id] = { name, count: 0 };
      counts[id].count++;
    }

    const total = allProgress.length || 1;
    return Object.entries(counts).map(([id, data]) => ({
      levelId: id,
      levelName: data.name,
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }

  /**
   * Horas de estudio por semana (últimas 8 semanas).
   */
  async getWeeklyStudyHours(): Promise<WeeklyStudyHours[]> {
    const now = new Date();
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const reports = await StudyReport.aggregate([
      { $match: { date: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%G-W%V', date: '$date' } },
          totalHours: { $sum: '$totalHours' },
          reportCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return reports.map(r => ({
      week: r._id,
      totalHours: Math.round(r.totalHours * 10) / 10,
      reportCount: r.reportCount,
    }));
  }

  /**
   * Alertas accionables para el admin.
   */
  async getAlerts(): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];

    // 1. Exámenes pendientes de evaluación
    const pendingEvals = await ExamAttempt.find({ status: 'pending_evaluation' })
      .populate('employee', 'name email')
      .populate('exam', 'title')
      .lean();
    if (pendingEvals.length > 0) {
      alerts.push({
        type: 'pending_evaluation',
        severity: 'high',
        message: `${pendingEvals.length} examen(es) pendiente(s) de evaluación manual`,
        count: pendingEvals.length,
        data: pendingEvals.map(a => ({
          employeeName: (a.employee as any)?.name,
          examTitle: (a.exam as any)?.title,
          attemptId: a._id,
        })),
      });
    }

    // 2. Empleados sin reporte esta semana
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const allActive = await EmployeeTrainingProgress.find({ active: true }).select('employee').lean();
    const reporters = await StudyReport.distinct('employee', { date: { $gte: weekStart } });
    const reporterIds = reporters.map(r => r.toString());
    const noReport = allActive.filter(p => !reporterIds.includes(p.employee.toString()));

    if (noReport.length > 0) {
      const employees = await Employee.find({ _id: { $in: noReport.map(p => p.employee) } })
        .select('name email').lean();
      alerts.push({
        type: 'no_report',
        severity: 'medium',
        message: `${noReport.length} empleado(s) sin reporte de estudio esta semana`,
        count: noReport.length,
        data: employees.map(e => ({ name: e.name, email: e.email })),
      });
    }

    // 3. Empleados estancados (sin progreso en +14 días)
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastReports = await StudyReport.aggregate([
      { $group: { _id: '$employee', lastReport: { $max: '$date' } } },
      { $match: { lastReport: { $lt: twoWeeksAgo } } },
    ]);
    if (lastReports.length > 0) {
      alerts.push({
        type: 'stalled',
        severity: 'low',
        message: `${lastReports.length} empleado(s) sin actividad en más de 2 semanas`,
        count: lastReports.length,
      });
    }

    // 4. Bonos pendientes de pago
    const pendingBonuses = await BonusRecord.countDocuments({ status: 'pending' });
    if (pendingBonuses > 0) {
      alerts.push({
        type: 'pending_bonus',
        severity: 'medium',
        message: `${pendingBonuses} bono(s) pendiente(s) de pago`,
        count: pendingBonuses,
      });
    }

    // 5. Exámenes reprobados (empleados bloqueados)
    const failedAttempts = await ExamAttempt.find({ status: 'failed' })
      .populate('employee', 'name')
      .populate('exam', 'title maxAttempts')
      .lean();
    // Filtrar solo los que agotaron intentos
    const blockedEmployees = failedAttempts.filter(a => {
      // Simplificado — contar como bloqueado si el último intento fue failed
      return true;
    });
    if (failedAttempts.length > 0) {
      alerts.push({
        type: 'failed_exam',
        severity: 'low',
        message: `${failedAttempts.length} intento(s) de examen reprobado(s)`,
        count: failedAttempts.length,
      });
    }

    return alerts.sort((a, b) => {
      const severity = { high: 0, medium: 1, low: 2 };
      return severity[a.severity] - severity[b.severity];
    });
  }

  /**
   * Detalle del progreso de un empleado específico.
   */
  async getEmployeeDetail(employeeId: string): Promise<any> {
    const employee = await Employee.findById(employeeId).select('name email photo division role')
      .populate('division', 'name').populate('role', 'name').lean();
    
    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId })
      .populate('currentLevel', 'name order')
      .populate('latestBadge', 'name icon shape color')
      .populate('badges.badge', 'name icon shape color')
      .populate('levels.level', 'name order')
      .populate('courses.course', 'name estimatedHours')
      .lean();

    const recentReports = await StudyReport.find({ employee: employeeId })
      .sort({ date: -1 }).limit(10).populate('entries.course', 'name').lean();

    const examAttempts = await ExamAttempt.find({ employee: employeeId })
      .sort({ createdAt: -1 }).limit(5).populate('exam', 'title').lean();

    return { employee, progress, recentReports, examAttempts };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = start of week
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

export const dashboardService = new DashboardService();

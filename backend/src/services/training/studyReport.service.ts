import { Types } from 'mongoose';
import { StudyReport, IStudyReport } from '../../models/training/StudyReport';
import { Course } from '../../models/training/Course';
import { Employee } from '../../models/Employee';
import { AppError } from '../../middleware/error';

/**
 * StudyReportService — Gestión de reportes diarios de estudio.
 *
 * Ventana semanal: jueves a miércoles (D9).
 * Días obligatorios: lunes, miércoles, viernes (D8).
 * Mínimo: 1h por día obligatorio, 3h por semana.
 */

// Helpers para calcular la ventana semanal (jueves-miércoles)
function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu, ..., 6=Sat

  // Encontrar el jueves anterior o actual
  let daysToThursday = dayOfWeek - 4; // 4 = Thursday
  if (daysToThursday < 0) daysToThursday += 7;

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToThursday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

interface CreateReportInput {
  date: string; // ISO date string
  entries: Array<{
    course: string;
    hoursSpent: number;
    completed: boolean;
    progress?: string;
  }>;
  observations?: string;
}

class StudyReportService {

  /**
   * Crear o actualizar reporte del día.
   */
  async createOrUpdate(employeeId: string, data: CreateReportInput): Promise<IStudyReport> {
    const reportDate = new Date(data.date);
    reportDate.setHours(0, 0, 0, 0);

    // Validar que no sea futuro
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (reportDate > today) {
      throw new AppError('No puedes reportar para una fecha futura', 400);
    }

    // Validar que está dentro de la ventana semanal actual
    const { weekStart, weekEnd } = getWeekBounds(new Date());
    if (reportDate < weekStart) {
      throw new AppError('No puedes reportar para semanas anteriores. Solo la semana actual.', 400);
    }

    // Calcular bounds de la semana del reporte
    const reportWeek = getWeekBounds(reportDate);

    // Validar cursos
    for (const entry of data.entries) {
      if (!Types.ObjectId.isValid(entry.course)) throw new AppError('ID de curso inválido', 400);
      const course = await Course.findById(entry.course);
      if (!course) throw new AppError(`Curso ${entry.course} no encontrado`, 404);
    }

    // Calcular total horas
    const totalHours = data.entries.reduce((sum, e) => sum + e.hoursSpent, 0);
    if (totalHours > 12) throw new AppError('No puedes reportar más de 12 horas en un solo día', 400);
    if (totalHours < 0.25) throw new AppError('Debes reportar al menos 15 minutos (0.25h)', 400);

    // Crear o actualizar
    const report = await StudyReport.findOneAndUpdate(
      { employee: employeeId, date: reportDate },
      {
        employee: employeeId,
        date: reportDate,
        weekStart: reportWeek.weekStart,
        weekEnd: reportWeek.weekEnd,
        entries: data.entries,
        totalHours,
        observations: data.observations,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('entries.course', 'name');

    return report!;
  }

  /**
   * Obtener reportes de un empleado en la semana actual.
   */
  async getMyWeekReports(employeeId: string): Promise<IStudyReport[]> {
    const { weekStart, weekEnd } = getWeekBounds(new Date());

    return StudyReport.find({
      employee: employeeId,
      date: { $gte: weekStart, $lte: weekEnd },
    })
      .populate('entries.course', 'name')
      .sort({ date: 1 });
  }

  /**
   * Obtener resumen semanal de todos los empleados (pase de lista admin).
   * Retorna: por empleado, qué días reportó y total horas.
   * Incluye TODOS los empleados activos (no solo los que reportaron).
   */
  async getWeeklyAttendance(weekDate?: string): Promise<any[]> {
    const targetDate = weekDate ? new Date(weekDate) : new Date();
    const { weekStart, weekEnd } = getWeekBounds(targetDate);

    // 1. Traer TODOS los empleados activos (el campo deleted tiene select:false, basta con status)
    const allEmployees = await Employee.find({ status: 'active' })
      .select('name email')
      .sort({ name: 1 });

    // 2. Traer todos los reportes de la semana
    const reports = await StudyReport.find({
      date: { $gte: weekStart, $lte: weekEnd },
    }).sort({ date: 1 });

    // 3. Indexar reportes por empleado
    const reportsByEmployee: Record<string, Array<{ date: string; totalHours: number }>> = {};
    for (const report of reports) {
      const empId = report.employee.toString();
      if (!reportsByEmployee[empId]) {
        reportsByEmployee[empId] = [];
      }
      reportsByEmployee[empId].push({
        date: report.date.toISOString().split('T')[0],
        totalHours: report.totalHours,
      });
    }

    // 4. Construir resultado con TODOS los empleados
    return allEmployees.map(emp => {
      const empId = emp._id.toString();
      const empReports = reportsByEmployee[empId] || [];
      const totalWeekHours = empReports.reduce((sum, r) => sum + r.totalHours, 0);

      return {
        employee: { _id: empId, name: emp.name, email: emp.email },
        reports: empReports,
        totalWeekHours,
      };
    });
  }

  /**
   * Obtener total de horas de la semana de un empleado.
   */
  async getWeeklyTotal(employeeId: string): Promise<number> {
    const { weekStart, weekEnd } = getWeekBounds(new Date());
    const reports = await StudyReport.find({
      employee: employeeId,
      date: { $gte: weekStart, $lte: weekEnd },
    });
    return reports.reduce((sum, r) => sum + r.totalHours, 0);
  }
}

export const studyReportService = new StudyReportService();

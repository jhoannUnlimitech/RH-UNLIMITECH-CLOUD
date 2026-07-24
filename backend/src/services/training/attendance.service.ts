import { AttendanceRecord, IAttendanceRecord } from '../../models/training/AttendanceRecord';
import { Employee } from '../../models/Employee';
import { systemConfigService } from '../systemConfig.service';
import { AppError } from '../../middleware/error';

/**
 * AttendanceService — Pase de lista manual de estudio.
 *
 * El encargado de Training pasa lista L/M/V marcando asistencia.
 * Se puede marcar en bulk (todos los empleados de un día) o individual.
 */

// Helper: obtener bounds de la semana (lunes a domingo)
function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb

  // Calcular lunes de esta semana
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToMonday);

  // Domingo = lunes + 6
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

interface BulkMarkInput {
  date: string; // ISO date (YYYY-MM-DD)
  records: Array<{
    employee: string;
    present: boolean;
    notes?: string;
  }>;
}

class AttendanceService {

  /**
   * Marcar asistencia en bulk para un día.
   * Crea o actualiza el registro de cada empleado para la fecha dada.
   */
  async markBulk(markedById: string, data: BulkMarkInput): Promise<IAttendanceRecord[]> {
    const date = new Date(data.date + 'T12:00:00'); // Fijar al mediodía para evitar problemas de timezone
    date.setHours(0, 0, 0, 0);

    // Validar que sea día obligatorio de estudio (desde config)
    const studyDays = await systemConfigService.getStudyDays();
    const dayOfWeek = date.getDay();
    if (!studyDays.includes(dayOfWeek)) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const allowedDays = studyDays.map(d => dayNames[d]).join(', ');
      throw new AppError(`El pase de lista solo se realiza: ${allowedDays}`, 400);
    }

    // Verificar si es festivo
    const isHoliday = await systemConfigService.isHoliday(date);
    if (isHoliday) {
      throw new AppError('No se pasa lista en días festivos', 400);
    }

    const results: IAttendanceRecord[] = [];

    for (const record of data.records) {
      const updated = await AttendanceRecord.findOneAndUpdate(
        { employee: record.employee, date },
        {
          employee: record.employee,
          date,
          present: record.present,
          markedBy: markedById,
          notes: record.notes || undefined,
        },
        { upsert: true, new: true }
      );
      results.push(updated!);
    }

    return results;
  }

  /**
   * Marcar asistencia individual para un empleado en una fecha.
   */
  async markOne(markedById: string, employeeId: string, date: string, present: boolean, notes?: string): Promise<IAttendanceRecord> {
    const d = new Date(date + 'T12:00:00'); // Fijar al mediodía para evitar problemas de timezone
    d.setHours(0, 0, 0, 0);

    // Validar que sea día obligatorio de estudio (desde config)
    const studyDays = await systemConfigService.getStudyDays();
    const dayOfWeek = d.getDay();
    if (!studyDays.includes(dayOfWeek)) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const allowedDays = studyDays.map(d => dayNames[d]).join(', ');
      throw new AppError(`El pase de lista solo se realiza: ${allowedDays}`, 400);
    }

    // Verificar si es festivo
    const isHoliday = await systemConfigService.isHoliday(d);
    if (isHoliday) {
      throw new AppError('No se pasa lista en días festivos', 400);
    }

    // Solo validar que no sea más de 2 semanas en el futuro
    const maxFuture = new Date();
    maxFuture.setDate(maxFuture.getDate() + 14);
    if (d > maxFuture) {
      throw new AppError('No puedes pasar lista para una fecha tan lejana', 400);
    }

    const record = await AttendanceRecord.findOneAndUpdate(
      { employee: employeeId, date: d },
      {
        employee: employeeId,
        date: d,
        present,
        markedBy: markedById,
        notes: notes || undefined,
      },
      { upsert: true, new: true }
    );

    return record!;
  }

  /**
   * Marcar un empleado como exento para una fecha (vacaciones, permiso, CSW aprobado).
   */
  async markExempt(markedById: string, employeeId: string, date: string, reason?: string): Promise<IAttendanceRecord> {
    const d = new Date(date + 'T12:00:00');
    d.setHours(0, 0, 0, 0);

    const record = await AttendanceRecord.findOneAndUpdate(
      { employee: employeeId, date: d },
      {
        employee: employeeId,
        date: d,
        present: false,
        exempt: true,
        exemptReason: reason || 'Exento',
        markedBy: markedById,
      },
      { upsert: true, new: true }
    );

    return record!;
  }

  /**
   * Obtener asistencia semanal para todos los empleados activos.
   * Retorna la lista de empleados con su estado por cada día L/M/V de la semana.
   */
  async getWeeklyAttendance(weekDate?: string): Promise<{
    weekStart: string;
    weekEnd: string;
    obligatoryDays: string[];
    employees: Array<{
      employee: { _id: string; name: string; email: string };
      days: Record<string, { present: boolean; exempt?: boolean; exemptReason?: string; notes?: string } | null>;
      totalPresent: number;
      totalAbsent: number;
    }>;
  }> {
    const targetDate = weekDate ? new Date(weekDate) : new Date();
    const { weekStart, weekEnd } = getWeekBounds(targetDate);

    // Calcular los días obligatorios de estudio de la semana (desde config)
    const studyDays = await systemConfigService.getStudyDays();
    const obligatoryDays: Date[] = [];
    const current = new Date(weekStart);
    while (current <= weekEnd) {
      const dow = current.getDay();
      if (studyDays.includes(dow)) {
        obligatoryDays.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    // Traer todos los empleados activos
    const allEmployees = await Employee.find({ status: 'active' })
      .select('name email')
      .sort({ name: 1 });

    // Traer registros de asistencia de la semana
    const records = await AttendanceRecord.find({
      date: { $gte: weekStart, $lte: weekEnd },
    });

    // Indexar registros: empId_dateStr → record
    const recordsMap: Record<string, IAttendanceRecord> = {};
    for (const rec of records) {
      const key = `${rec.employee.toString()}_${rec.date.toISOString().split('T')[0]}`;
      recordsMap[key] = rec;
    }

    // Construir resultado
    const employees = allEmployees.map(emp => {
      const empId = emp._id.toString();
      const days: Record<string, { present: boolean; exempt?: boolean; exemptReason?: string; notes?: string } | null> = {};
      let totalPresent = 0;
      let totalAbsent = 0;

      for (const day of obligatoryDays) {
        const dateStr = day.toISOString().split('T')[0];
        const key = `${empId}_${dateStr}`;
        const rec = recordsMap[key];

        if (rec) {
          days[dateStr] = { present: rec.present, exempt: rec.exempt || false, exemptReason: rec.exemptReason, notes: rec.notes };
          if (rec.exempt) { /* no cuenta ni como presente ni como ausente */ }
          else if (rec.present) totalPresent++;
          else totalAbsent++;
        } else {
          days[dateStr] = null; // No marcado aún
        }
      }

      return {
        employee: { _id: empId, name: emp.name, email: emp.email },
        days,
        totalPresent,
        totalAbsent,
      };
    });

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      obligatoryDays: obligatoryDays.map(d => d.toISOString().split('T')[0]),
      employees,
    };
  }
}

export const attendanceService = new AttendanceService();

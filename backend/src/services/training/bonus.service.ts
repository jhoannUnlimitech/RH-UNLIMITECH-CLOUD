import mongoose from 'mongoose';
import { BonusRange, IBonusRange } from '../../models/training/BonusRange';
import { BonusRecord, IBonusRecord } from '../../models/training/BonusRecord';
import { StudyReport } from '../../models/training/StudyReport';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { AppError } from '../../middleware/error';

/**
 * BonusService — Gestión de bonificaciones trimestrales por estudio.
 *
 * Flujo:
 * 1. Admin configura rangos de bonificación (BonusRange)
 * 2. Al final del trimestre (o manual), se calculan los bonos
 * 3. Cada empleado con horas > mínimo del primer rango recibe un BonusRecord
 * 4. Admin marca como "pagado" los bonos monetarios
 */

class BonusService {

  // ─── BONUS RANGES (CRUD) ────────────────────────────────────────────────────

  async getRanges(): Promise<IBonusRange[]> {
    return BonusRange.find({ active: true }).sort({ order: 1 });
  }

  async getAllRanges(): Promise<IBonusRange[]> {
    return BonusRange.find().sort({ order: 1 });
  }

  async createRange(data: Partial<IBonusRange>): Promise<IBonusRange> {
    if (!data.name || data.minHours === undefined || !data.prizeDescription) {
      throw new AppError('Nombre, horas mínimas y descripción del premio son requeridos', 400);
    }
    // Auto-asignar orden si no se provee
    if (!data.order) {
      const last = await BonusRange.findOne().sort({ order: -1 });
      data.order = (last?.order || 0) + 1;
    }
    return BonusRange.create(data);
  }

  async updateRange(id: string, data: Partial<IBonusRange>): Promise<IBonusRange> {
    const range = await BonusRange.findByIdAndUpdate(id, data, { new: true });
    if (!range) throw new AppError('Rango no encontrado', 404);
    return range;
  }

  async deleteRange(id: string): Promise<void> {
    const range = await BonusRange.findById(id);
    if (!range) throw new AppError('Rango no encontrado', 404);
    range.active = false;
    await range.save();
  }

  // ─── BONUS CALCULATION ──────────────────────────────────────────────────────

  /**
   * Calcular bonificaciones para un trimestre.
   * Crea BonusRecord para cada empleado que califica.
   */
  async calculateQuarterlyBonuses(quarter: number, year: number): Promise<{
    created: number;
    skipped: number;
    noRange: number;
  }> {
    if (quarter < 1 || quarter > 4) throw new AppError('Trimestre debe ser 1-4', 400);

    // Obtener rangos activos ordenados
    const ranges = await BonusRange.find({ active: true }).sort({ minHours: 1 });
    if (ranges.length === 0) throw new AppError('No hay rangos de bonificación configurados', 400);

    // Calcular rango de fechas del trimestre
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);

    // Obtener empleados con progreso activo
    const activeProgress = await EmployeeTrainingProgress.find({ active: true }).select('employee').lean();
    const activeIds = activeProgress.map(p => p.employee);

    // Aggregar horas por empleado
    const aggregation = await StudyReport.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          employee: { $in: activeIds },
        },
      },
      {
        $group: {
          _id: '$employee',
          totalHours: { $sum: '$totalHours' },
        },
      },
    ]);

    let created = 0;
    let skipped = 0;
    let noRange = 0;

    for (const agg of aggregation) {
      const employeeId = agg._id;
      const totalHours = agg.totalHours;

      // Verificar si ya tiene bono este trimestre
      const existing = await BonusRecord.findOne({ employee: employeeId, quarter, year });
      if (existing) { skipped++; continue; }

      // Encontrar el rango que aplica (el más alto donde totalHours >= minHours)
      let matchedRange: IBonusRange | null = null;
      for (const range of ranges) {
        if (totalHours >= range.minHours) {
          if (range.maxHours === null || totalHours <= range.maxHours) {
            matchedRange = range;
          }
        }
      }

      // El más alto que matchea (iterar reverso)
      matchedRange = null;
      for (let i = ranges.length - 1; i >= 0; i--) {
        const r = ranges[i];
        if (totalHours >= r.minHours && (r.maxHours === null || totalHours <= r.maxHours)) {
          matchedRange = r;
          break;
        }
      }

      if (!matchedRange) { noRange++; continue; }

      // Crear BonusRecord
      const status = matchedRange.prizeType === 'monetary' ? 'pending' : 'acknowledged';
      await BonusRecord.create({
        employee: employeeId,
        quarter,
        year,
        totalHours: Math.round(totalHours * 100) / 100,
        bonusRange: {
          name: matchedRange.name,
          prizeType: matchedRange.prizeType,
          prizeDescription: matchedRange.prizeDescription,
          prizeAmount: matchedRange.prizeAmount,
          prizeCurrency: matchedRange.prizeCurrency,
          color: matchedRange.color,
        },
        status,
      });
      created++;
    }

    return { created, skipped, noRange };
  }

  // ─── BONUS RECORDS (QUERY + PAY) ───────────────────────────────────────────

  /**
   * Obtener bonos de un trimestre.
   */
  async getQuarterBonuses(quarter: number, year: number): Promise<IBonusRecord[]> {
    return BonusRecord.find({ quarter, year })
      .populate('employee', 'name email photo')
      .populate('paidBy', 'name')
      .sort({ totalHours: -1 });
  }

  /**
   * Obtener bonos pendientes de pago.
   */
  async getPendingBonuses(): Promise<IBonusRecord[]> {
    return BonusRecord.find({ status: 'pending' })
      .populate('employee', 'name email photo')
      .sort({ year: -1, quarter: -1, totalHours: -1 });
  }

  /**
   * Marcar un bono como pagado.
   */
  async markAsPaid(bonusId: string, paidById: string, notes?: string): Promise<IBonusRecord> {
    const bonus = await BonusRecord.findById(bonusId);
    if (!bonus) throw new AppError('Bono no encontrado', 404);
    if (bonus.status === 'paid') throw new AppError('Este bono ya fue pagado', 400);

    bonus.status = 'paid';
    bonus.paidAt = new Date();
    bonus.paidBy = paidById as any;
    if (notes) bonus.notes = notes;
    await bonus.save();

    return bonus;
  }

  /**
   * Obtener bonos de un empleado específico.
   */
  async getEmployeeBonuses(employeeId: string): Promise<IBonusRecord[]> {
    return BonusRecord.find({ employee: employeeId }).sort({ year: -1, quarter: -1 });
  }
}

export const bonusService = new BonusService();

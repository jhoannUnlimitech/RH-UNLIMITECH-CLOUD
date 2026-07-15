import { Types } from 'mongoose';
import { Badge, IBadge } from '../../models/training/Badge';
import { Level } from '../../models/training/Level';
import { Course } from '../../models/training/Course';
import { AppError } from '../../middleware/error';

/**
 * BadgeService — Lógica de negocio para Insignias de Training.
 *
 * Cada insignia contiene niveles. totalCourses se recalcula al modificar.
 */

interface CreateBadgeInput {
  name: string;
  description: string;
  icon: string;
  shape: string;
  color: string;
  levels?: string[];
  active?: boolean;
}

interface UpdateBadgeInput {
  name?: string;
  description?: string;
  icon?: string;
  shape?: string;
  color?: string;
  levels?: string[];
  active?: boolean;
}

class BadgeService {

  async getAll(filters?: { active?: boolean }): Promise<IBadge[]> {
    const query: any = {};
    if (filters?.active !== undefined) query.active = filters.active;

    return Badge.find(query)
      .populate('levels', 'name order courses')
      .sort({ name: 1 });
  }

  async getById(id: string): Promise<IBadge> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de insignia no válido', 400);
    }
    const badge = await Badge.findById(id)
      .populate({
        path: 'levels',
        options: { sort: { order: 1 } },
        populate: [
          { path: 'courses', select: 'name order estimatedHours active' },
          { path: 'exam', select: 'name passingScore' }
        ]
      });

    if (!badge) throw new AppError('Insignia no encontrada', 404);
    return badge;
  }

  async create(data: CreateBadgeInput): Promise<IBadge> {
    // Verificar nombre único
    const existing = await Badge.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Ya existe una insignia con ese nombre', 400);
    }

    const badge = new Badge(data);

    // Calcular totalCourses si tiene niveles
    if (data.levels && data.levels.length > 0) {
      badge.totalCourses = await this.calculateTotalCourses(data.levels);
    }

    await badge.save();
    await badge.populate('levels', 'name order');
    return badge;
  }

  async update(id: string, data: UpdateBadgeInput): Promise<IBadge> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de insignia no válido', 400);
    }

    const badge = await Badge.findById(id);
    if (!badge) throw new AppError('Insignia no encontrada', 404);

    // Verificar nombre único si cambia
    if (data.name && data.name !== badge.name) {
      const existing = await Badge.findOne({ name: data.name, _id: { $ne: id } });
      if (existing) throw new AppError('Ya existe una insignia con ese nombre', 400);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (badge as any)[key] = value;
      }
    });

    // Recalcular totalCourses si levels cambió
    if (data.levels) {
      badge.totalCourses = await this.calculateTotalCourses(data.levels);
    }

    await badge.save();
    await badge.populate('levels', 'name order');
    return badge;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de insignia no válido', 400);
    }
    const badge = await Badge.findById(id);
    if (!badge) throw new AppError('Insignia no encontrada', 404);

    // Verificar que no tenga niveles activos
    const activeLevels = await Level.countDocuments({ badge: id, deleted: { $ne: true } });
    if (activeLevels > 0) {
      throw new AppError(`No se puede eliminar. La insignia tiene ${activeLevels} nivel(es) activo(s)`, 400);
    }

    await badge.softDelete();
  }

  /**
   * Recalcular totalCourses para una insignia (suma de cursos de todos sus niveles).
   */
  async recalculateTotalCourses(badgeId: string): Promise<number> {
    const levels = await Level.find({ badge: badgeId, deleted: { $ne: true } });
    const levelIds = levels.map(l => l._id);
    const count = await Course.countDocuments({ level: { $in: levelIds }, deleted: { $ne: true } });

    await Badge.findByIdAndUpdate(badgeId, { totalCourses: count });
    return count;
  }

  /**
   * Calcular totalCourses para un array de level IDs.
   */
  private async calculateTotalCourses(levelIds: string[]): Promise<number> {
    return Course.countDocuments({
      level: { $in: levelIds.map(id => new Types.ObjectId(id)) },
      deleted: { $ne: true }
    });
  }
}

export const badgeService = new BadgeService();

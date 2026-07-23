import { Types } from 'mongoose';
import { Level, ILevel } from '../../models/training/Level';
import { AppError } from '../../middleware/error';

/**
 * LevelService — Lógica de negocio para Niveles de Training.
 *
 * Los niveles siguen un orden secuencial estricto dentro de una insignia (D1).
 * Cada nivel agrupa cursos y tiene un examen asociado opcionalmente.
 */

interface CreateLevelInput {
  name: string;
  description?: string;
  order?: number;
  badge: string;
  exam?: string;
  courses?: string[];
  requiredCoursesCount?: number;
  active?: boolean;
}

interface UpdateLevelInput {
  name?: string;
  description?: string;
  order?: number;
  badge?: string;
  exam?: string;
  courses?: string[];
  requiredCoursesCount?: number;
  active?: boolean;
}

class LevelService {

  async getAll(filters?: { badge?: string; active?: boolean }): Promise<any[]> {
    const query: any = {};
    if (filters?.badge) query.badge = filters.badge;
    if (filters?.active !== undefined) query.active = filters.active;

    // Use aggregate to avoid circular reference issues with populate
    const levels = await Level.aggregate([
      { $match: { ...query, deleted: { $ne: true } } },
      {
        $lookup: {
          from: 'badges',
          localField: 'badge',
          foreignField: '_id',
          as: 'badgeInfo'
        }
      },
      {
        $lookup: {
          from: 'exams',
          localField: 'exam',
          foreignField: '_id',
          as: 'examInfo'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          order: 1,
          active: 1,
          courses: 1,
          requiredCoursesCount: 1,
          createdAt: 1,
          badge: { $arrayElemAt: ['$badgeInfo', 0] },
          exam: { $arrayElemAt: ['$examInfo', 0] },
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          order: 1,
          active: 1,
          coursesCount: { $size: { $ifNull: ['$courses', []] } },
          courses: 1,
          requiredCoursesCount: 1,
          createdAt: 1,
          'badge._id': 1,
          'badge.name': 1,
          'badge.icon': 1,
          'badge.shape': 1,
          'badge.color': 1,
          'exam._id': 1,
          'exam.title': 1,
          'exam.passingScore': 1,
        }
      },
      { $sort: { order: 1 } }
    ]);

    return levels;
  }

  async getByBadge(badgeId: string): Promise<ILevel[]> {
    if (!Types.ObjectId.isValid(badgeId)) {
      throw new AppError('ID de insignia no válido', 400);
    }
    const levels = await Level.find({ badge: badgeId, deleted: { $ne: true } })
      .select('-__v')
      .populate('exam', 'title passingScore')
      .sort({ order: 1 });

    return levels.map(l => {
      const obj = l.toObject();
      return { ...obj, coursesCount: obj.courses?.length || 0 };
    }) as any;
  }

  async getById(id: string): Promise<ILevel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nivel no válido', 400);
    }
    const level = await Level.findById(id)
      .populate('badge', 'name icon shape color')
      .populate('courses', 'name description order estimatedHours active link libraryDocument')
      .populate('exam', 'name description passingScore maxAttempts');

    if (!level) throw new AppError('Nivel no encontrado', 404);
    return level;
  }

  async create(data: CreateLevelInput): Promise<ILevel> {
    if (!Types.ObjectId.isValid(data.badge)) {
      throw new AppError('ID de insignia no válido', 400);
    }

    // Auto-order si no se proporciona
    if (data.order === undefined || data.order === null) {
      const lastLevel = await Level.findOne({ badge: data.badge }).sort({ order: -1 });
      data.order = lastLevel ? lastLevel.order + 1 : 0;
    }

    const level = new Level(data);
    await level.save();
    await level.populate('badge', 'name icon shape color');
    await level.populate('courses', 'name order');

    return level;
  }

  async update(id: string, data: UpdateLevelInput): Promise<ILevel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nivel no válido', 400);
    }

    const level = await Level.findById(id);
    if (!level) throw new AppError('Nivel no encontrado', 404);

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (level as any)[key] = value === null ? undefined : value;
      }
    });

    await level.save();
    await level.populate('badge', 'name icon shape color');
    await level.populate('courses', 'name order');

    return level;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de nivel no válido', 400);
    }
    const level = await Level.findById(id);
    if (!level) throw new AppError('Nivel no encontrado', 404);
    await level.softDelete();
  }

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.id) },
        update: { $set: { order: item.order } }
      }
    }));
    await Level.bulkWrite(bulkOps);
  }
}

export const levelService = new LevelService();

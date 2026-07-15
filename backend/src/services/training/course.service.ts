import { Types } from 'mongoose';
import { Course, ICourse } from '../../models/training/Course';
import { AppError } from '../../middleware/error';

/**
 * CourseService — Lógica de negocio para Cursos de Training.
 *
 * Un curso pertenece a un Level. El order determina la secuencia.
 * Puede tener un libraryDocument asociado como material de lectura.
 */

interface CreateCourseInput {
  name: string;
  description: string;
  link?: string;
  libraryDocument?: string;
  order?: number;
  level: string;
  estimatedHours?: number;
  active?: boolean;
}

interface UpdateCourseInput {
  name?: string;
  description?: string;
  link?: string | null;
  libraryDocument?: string;
  order?: number;
  level?: string;
  estimatedHours?: number | null;
  active?: boolean;
}

class CourseService {

  /**
   * Listar cursos con filtros.
   */
  async getAll(filters?: { level?: string; active?: boolean }): Promise<ICourse[]> {
    const query: any = {};
    if (filters?.level) query.level = filters.level;
    if (filters?.active !== undefined) query.active = filters.active;

    return Course.find(query)
      .populate('level', 'name order')
      .populate('libraryDocument', 'title slug type')
      .sort({ level: 1, order: 1 });
  }

  /**
   * Obtener cursos de un nivel específico.
   */
  async getByLevel(levelId: string): Promise<ICourse[]> {
    if (!Types.ObjectId.isValid(levelId)) {
      throw new AppError('ID de nivel no válido', 400);
    }
    return Course.find({ level: levelId })
      .populate('libraryDocument', 'title slug type')
      .sort({ order: 1 });
  }

  /**
   * Obtener curso por ID.
   */
  async getById(id: string): Promise<ICourse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de curso no válido', 400);
    }
    const course = await Course.findById(id)
      .populate('level', 'name order badge')
      .populate('libraryDocument', 'title slug type content');

    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }
    return course;
  }

  /**
   * Crear un nuevo curso.
   */
  async create(data: CreateCourseInput): Promise<ICourse> {
    if (!Types.ObjectId.isValid(data.level)) {
      throw new AppError('ID de nivel no válido', 400);
    }

    // Validar libraryDocument si se proporciona
    if (data.libraryDocument) {
      if (!Types.ObjectId.isValid(data.libraryDocument)) {
        throw new AppError('ID de documento no válido', 400);
      }
    }

    // Si no se proporciona order, asignar el siguiente disponible
    if (data.order === undefined || data.order === null) {
      const lastCourse = await Course.findOne({ level: data.level }).sort({ order: -1 });
      data.order = lastCourse ? lastCourse.order + 1 : 0;
    }

    const course = new Course(data);
    await course.save();
    await course.populate('level', 'name order');
    await course.populate('libraryDocument', 'title slug type');

    return course;
  }

  /**
   * Actualizar un curso.
   */
  async update(id: string, data: UpdateCourseInput): Promise<ICourse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de curso no válido', 400);
    }

    const course = await Course.findById(id);
    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    // Validar level si se cambia
    if (data.level && !Types.ObjectId.isValid(data.level)) {
      throw new AppError('ID de nivel no válido', 400);
    }

    // Aplicar cambios
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (course as any)[key] = value === null ? undefined : value;
      }
    });

    await course.save();
    await course.populate('level', 'name order');
    await course.populate('libraryDocument', 'title slug type');

    return course;
  }

  /**
   * Eliminar curso (soft delete).
   */
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de curso no válido', 400);
    }

    const course = await Course.findById(id);
    if (!course) {
      throw new AppError('Curso no encontrado', 404);
    }

    await course.softDelete();
  }

  /**
   * Reordenar cursos dentro de un nivel.
   */
  async reorder(items: { id: string; order: number }[]): Promise<void> {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.id) },
        update: { $set: { order: item.order } }
      }
    }));
    await Course.bulkWrite(bulkOps);
  }
}

export const courseService = new CourseService();

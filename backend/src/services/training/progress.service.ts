import { Types } from 'mongoose';
import { EmployeeTrainingProgress, IEmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { Badge } from '../../models/training/Badge';
import { Level } from '../../models/training/Level';
import { Course } from '../../models/training/Course';
import { AppError } from '../../middleware/error';

/**
 * ProgressService — Gestión del progreso de capacitación de empleados.
 *
 * Responsabilidades:
 * - Inicializar progreso al crear empleado (D21)
 * - Activar/desactivar con el empleado (D22)
 * - Consultar progreso individual
 */

class ProgressService {

  /**
   * Inicializar el progreso de un empleado nuevo (D21).
   * Crea el documento con todas las insignias, niveles y cursos disponibles.
   * Desbloquea el primer nivel de la primera insignia.
   */
  async initializeForEmployee(employeeId: string): Promise<IEmployeeTrainingProgress> {
    // Verificar que no exista ya
    const existing = await EmployeeTrainingProgress.findOne({ employee: employeeId });
    if (existing) return existing;

    // Cargar badges activos con sus niveles y cursos
    const badges = await Badge.find({ active: true, deleted: { $ne: true } })
      .sort({ name: 1 });

    const badgesProgress = [];
    const levelsProgress = [];
    const coursesProgress = [];
    let firstLevel: Types.ObjectId | undefined;

    for (let bIdx = 0; bIdx < badges.length; bIdx++) {
      const badge = badges[bIdx];
      const levels = await Level.find({ badge: badge._id, active: true, deleted: { $ne: true } })
        .sort({ order: 1 });

      badgesProgress.push({
        badge: badge._id,
        status: bIdx === 0 && levels.length > 0 ? 'in_progress' : 'not_started',
        percentage: 0,
        startedAt: bIdx === 0 && levels.length > 0 ? new Date() : undefined,
      });

      for (let lIdx = 0; lIdx < levels.length; lIdx++) {
        const level = levels[lIdx];
        // Primer nivel de la primera insignia: in_progress. Resto: locked.
        const isFirstLevel = bIdx === 0 && lIdx === 0;

        levelsProgress.push({
          level: level._id,
          status: isFirstLevel ? 'in_progress' : 'locked',
          startedAt: isFirstLevel ? new Date() : undefined,
          examAttempts: 0,
        });

        if (isFirstLevel) {
          firstLevel = level._id as Types.ObjectId;
        }

        // Cursos del nivel
        const courses = await Course.find({ level: level._id, active: true, deleted: { $ne: true } })
          .sort({ order: 1 });

        for (const course of courses) {
          coursesProgress.push({
            course: course._id,
            status: 'not_started',
          });
        }
      }
    }

    const progress = new EmployeeTrainingProgress({
      employee: employeeId,
      courses: coursesProgress,
      levels: levelsProgress,
      badges: badgesProgress,
      totalStudyHours: 0,
      currentLevel: firstLevel,
      active: true,
    });

    await progress.save();

    // Notificar al empleado que se le asignó su ruta de capacitación
    if (badgesProgress.length > 0) {
      try {
        const { notificationService } = await import('../../services/notification.service');
        await notificationService.create({
          recipient: employeeId,
          type: 'course_assigned',
          title: 'Bienvenido a Training',
          message: `Se te asignó tu ruta de capacitación. Tienes ${coursesProgress.length} curso(s) para comenzar.`,
          link: '/training/my-progress',
        });
      } catch { /* no bloquear si falla la notificación */ }
    }

    return progress;
  }

  /**
   * Obtener progreso de un empleado por su ID.
   */
  async getByEmployee(employeeId: string): Promise<IEmployeeTrainingProgress> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new AppError('ID de empleado no válido', 400);
    }

    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId })
      .populate('currentLevel', 'name order')
      .populate('currentCourse', 'name')
      .populate('latestBadge', 'name icon shape color')
      .populate('badges.badge', 'name icon shape color')
      .populate('levels.level', 'name order');

    if (!progress) {
      throw new AppError('Progreso no encontrado. El empleado puede no tener progreso inicializado.', 404);
    }

    return progress;
  }

  /**
   * Marcar progreso como inactivo (D22: empleado suspendido/eliminado).
   */
  async deactivate(employeeId: string): Promise<void> {
    await EmployeeTrainingProgress.updateOne(
      { employee: employeeId },
      { $set: { active: false } }
    );
  }

  /**
   * Reactivar progreso (D22: empleado reactivado).
   */
  async activate(employeeId: string): Promise<void> {
    await EmployeeTrainingProgress.updateOne(
      { employee: employeeId },
      { $set: { active: true } }
    );
  }

  /**
   * Verificar si el empleado tiene progreso inicializado.
   */
  async exists(employeeId: string): Promise<boolean> {
    return !!(await EmployeeTrainingProgress.exists({ employee: employeeId }));
  }
}

export const progressService = new ProgressService();

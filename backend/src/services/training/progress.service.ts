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
      .populate('levels.level', 'name order')
      .populate('courses.course', 'name description estimatedHours level order');

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

  /**
   * Marcar un curso como completado.
   *
   * Validaciones:
   * - El curso pertenece al nivel actual del empleado
   * - El curso no estaba ya completado
   *
   * Efectos:
   * - Actualiza ICourseProgress.status = 'completed' + completedAt
   * - Suma estimatedHours al totalStudyHours
   * - Si todos los cursos del nivel están completados → nivel pasa a 'exam_pending'
   * - Si el nivel no tiene examen → nivel pasa directo a 'completed' y desbloquea siguiente
   */
  async completeCourse(employeeId: string, courseId: string): Promise<{
    progress: IEmployeeTrainingProgress;
    levelStatus: string;
    examUnlocked: boolean;
    levelCompleted: boolean;
  }> {
    if (!Types.ObjectId.isValid(employeeId)) throw new AppError('ID de empleado no válido', 400);
    if (!Types.ObjectId.isValid(courseId)) throw new AppError('ID de curso no válido', 400);

    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId });
    if (!progress) throw new AppError('Progreso no encontrado', 404);

    // Buscar el curso en el progreso
    const courseProgress = progress.courses.find(c => c.course.toString() === courseId);
    if (!courseProgress) throw new AppError('Este curso no está asignado al empleado', 400);

    // Validar que no esté ya completado
    if (courseProgress.status === 'completed') {
      throw new AppError('Este curso ya está completado', 400);
    }

    // Obtener el curso para saber su nivel y horas
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Curso no encontrado', 404);

    // Validar que pertenece al nivel actual
    const currentLevelId = progress.currentLevel?.toString();
    if (currentLevelId && course.level.toString() !== currentLevelId) {
      throw new AppError('Este curso no pertenece a tu nivel actual. Debes completar los cursos en orden.', 400);
    }

    // Marcar curso como completado
    courseProgress.status = 'completed';
    courseProgress.completedAt = new Date();

    // Sumar horas estimadas al total
    if (course.estimatedHours) {
      progress.totalStudyHours += course.estimatedHours;
    }

    // Verificar si todos los cursos del nivel actual están completados
    const levelCourses = progress.courses.filter(c => {
      // Necesitamos verificar qué cursos pertenecen al nivel actual
      return true; // Filtraremos abajo
    });

    // Obtener todos los cursos del nivel actual desde la BD
    const allCoursesInLevel = await Course.find({ level: course.level, active: true, deleted: { $ne: true } });
    const allCourseIds = allCoursesInLevel.map(c => c._id.toString());

    const completedInLevel = progress.courses.filter(
      c => allCourseIds.includes(c.course.toString()) && c.status === 'completed'
    );

    const allCompleted = completedInLevel.length >= allCourseIds.length;

    let levelStatus = 'in_progress';
    let examUnlocked = false;
    let levelCompleted = false;

    if (allCompleted) {
      // Verificar si el nivel tiene examen
      const levelDoc = await Level.findById(course.level);
      const hasExam = levelDoc?.exam;

      const levelProgress = progress.levels.find(l => l.level.toString() === course.level.toString());

      if (hasExam) {
        // Cambiar nivel a exam_pending
        if (levelProgress) {
          levelProgress.status = 'exam_pending';
        }
        levelStatus = 'exam_pending';
        examUnlocked = true;

        // Notificar que el examen está disponible
        try {
          const { Exam } = await import('../../models/training/Exam');
          const exam = await Exam.findById(hasExam);
          if (exam) {
            const { notificationService } = await import('../../services/notification.service');
            await notificationService.notifyExamAssigned(employeeId, exam.title, exam._id.toString());
          }
        } catch { /* no bloquear */ }
      } else {
        // Sin examen → nivel completado directamente
        if (levelProgress) {
          levelProgress.status = 'completed';
          levelProgress.completedAt = new Date();
        }
        levelStatus = 'completed';
        levelCompleted = true;

        // Desbloquear siguiente nivel
        await this.unlockNextLevel(progress, course.level.toString());
      }
    }

    await progress.save();

    return { progress, levelStatus, examUnlocked, levelCompleted };
  }

  /**
   * Desbloquear el siguiente nivel en la secuencia de una insignia.
   */
  private async unlockNextLevel(progress: IEmployeeTrainingProgress, completedLevelId: string): Promise<void> {
    // Obtener el nivel completado para saber su badge y orden
    const completedLevel = await Level.findById(completedLevelId);
    if (!completedLevel) return;

    // Buscar el siguiente nivel de la misma insignia
    const nextLevel = await Level.findOne({
      badge: completedLevel.badge,
      order: completedLevel.order + 1,
      active: true,
      deleted: { $ne: true },
    });

    if (nextLevel) {
      // Desbloquear siguiente nivel
      const nextLevelProgress = progress.levels.find(l => l.level.toString() === nextLevel._id.toString());
      if (nextLevelProgress && nextLevelProgress.status === 'locked') {
        nextLevelProgress.status = 'in_progress';
        nextLevelProgress.startedAt = new Date();
        progress.currentLevel = nextLevel._id as Types.ObjectId;

        // Notificar
        try {
          const { notificationService } = await import('../../services/notification.service');
          await notificationService.notifyLevelUnlocked(progress.employee.toString(), nextLevel.name);
        } catch { /* no bloquear */ }
      }
    } else {
      // No hay siguiente nivel en esta insignia → BADGE EARNED
      const badgeProgress = progress.badges.find(b => {
        return b.badge.toString() === completedLevel.badge.toString();
      });
      if (badgeProgress && badgeProgress.status !== 'completed') {
        badgeProgress.status = 'completed';
        badgeProgress.percentage = 100;
        badgeProgress.earnedAt = new Date();
        progress.latestBadge = completedLevel.badge as Types.ObjectId;

        // Notificar
        try {
          const { notificationService } = await import('../../services/notification.service');
          const badge = await Badge.findById(completedLevel.badge);
          if (badge) {
            await notificationService.notifyBadgeEarned(progress.employee.toString(), badge.name);
          }
        } catch { /* no bloquear */ }

        // Desbloquear siguiente insignia (si existe)
        // TODO: implementar lógica de siguiente insignia en un slice futuro
      }
    }
  }
}

export const progressService = new ProgressService();

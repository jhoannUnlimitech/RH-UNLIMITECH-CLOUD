import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { progressService } from '../../services/training/progress.service';

/**
 * Progress Controller — Endpoints HTTP para progreso de capacitación.
 */

/** GET /api/v1/training/progress/me */
export const getMyProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const progress = await progressService.getByEmployee(req.user!.id);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/training/progress/:employeeId */
export const getProgressByEmployee = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const progress = await progressService.getByEmployee(employeeId);
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/training/progress/complete-course/:courseId */
export const completeCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const result = await progressService.completeCourse(req.user!.id, courseId);

    res.json({
      success: true,
      data: {
        progress: result.progress,
        levelStatus: result.levelStatus,
        examUnlocked: result.examUnlocked,
        levelCompleted: result.levelCompleted,
      },
      message: result.examUnlocked
        ? '¡Curso completado! El examen del nivel está ahora disponible.'
        : result.levelCompleted
          ? '¡Nivel completado! Avanzaste al siguiente nivel.'
          : 'Curso marcado como completado.',
    });
  } catch (error) {
    next(error);
  }
};

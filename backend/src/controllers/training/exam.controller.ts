import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { examService } from '../../services/training/exam.service';

/**
 * Exam Controller — Endpoints HTTP para exámenes de Training.
 */

/** GET /api/v1/training/exams */
export const getExams = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level, active } = req.query;
    const exams = await examService.getAll({
      level: level as string,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });

    res.json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/training/exams/me — Exámenes asignados al empleado actual */
export const getMyExams = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = req.user!.id;
    // Obtener el nivel actual del empleado desde su progreso
    const { progressService } = await import('../../services/training/progress.service');
    let currentLevelId: string | undefined;
    try {
      const progress = await progressService.getByEmployee(employeeId);
      currentLevelId = progress.currentLevel?.toString();
    } catch { /* progress may not exist yet */ }

    const exams = await examService.getMyExams(employeeId, currentLevelId);
    res.json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/training/exams/:id */
export const getExamById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    // Si el usuario no tiene training:manage, ocultar respuestas correctas
    const permissions = req.user?.role?.permissions || [];
    const hasManage = permissions.some((p: any) => p.resource === 'training' && p.action === 'manage');
    const stripAnswers = !hasManage;

    const exam = await examService.getById(id, stripAnswers);
    res.json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/training/exams */
export const createExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exam = await examService.create(req.body, req.user!.id);

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Examen creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/training/exams/:id */
export const updateExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const exam = await examService.update(id, req.body);

    res.json({
      success: true,
      data: exam,
      message: 'Examen actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/training/exams/:id/reorder-questions */
export const reorderQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const exam = await examService.reorderQuestions(id, req.body.questions);

    res.json({
      success: true,
      data: exam,
      message: 'Preguntas reordenadas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/v1/training/exams/:id */
export const deleteExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await examService.delete(id);

    res.json({
      success: true,
      message: 'Examen eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/training/exams/:id/assign/:employeeId */
export const assignExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, employeeId } = req.params;
    const exam = await examService.assignToEmployee(id, employeeId);

    res.json({
      success: true,
      data: exam,
      message: 'Examen asignado al empleado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

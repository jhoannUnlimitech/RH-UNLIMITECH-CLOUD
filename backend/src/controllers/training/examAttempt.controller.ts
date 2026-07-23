import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { examAttemptService } from '../../services/training/examAttempt.service';

/**
 * ExamAttempt Controller — Endpoints para tomar exámenes.
 */

/** POST /api/v1/training/exam-attempts/:examId/start */
export const startExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempt = await examAttemptService.startExam(req.user!.id, req.params.examId);
    res.status(201).json({ success: true, data: attempt });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/exam-attempts/:attemptId/cache */
export const saveCache = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await examAttemptService.saveCache(req.params.attemptId, req.user!.id, req.body.answers);
    res.json({ success: true, message: 'Cache guardado' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/exam-attempts/:attemptId/submit */
export const submitExam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempt = await examAttemptService.submitExam(req.params.attemptId, req.user!.id, req.body.answers);
    res.json({
      success: true,
      data: attempt,
      message: attempt.status === 'pending_evaluation'
        ? 'Examen enviado. Tiene preguntas que requieren evaluación manual.'
        : attempt.passed
          ? `¡Aprobado con ${attempt.percentage}%!`
          : `No aprobado (${attempt.percentage}%). Revisa el material.`,
    });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/exam-attempts/:attemptId */
export const getAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempt = await examAttemptService.getById(req.params.attemptId, req.user!.id);
    res.json({ success: true, data: attempt });
  } catch (error) { next(error); }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { examEvaluationService } from '../../services/training/examEvaluation.service';

/**
 * ExamEvaluation Controller — Endpoints para evaluación manual de exámenes.
 * Solo accesible por admins con training:manage.
 */

/** GET /api/v1/training/exam-attempts/pending-evaluation */
export const getPendingEvaluations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempts = await examEvaluationService.getPendingEvaluations();
    res.json({ success: true, data: attempts });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/exam-attempts/:attemptId/evaluate */
export const evaluateAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { questionOrder, score, feedback } = req.body;

    if (questionOrder === undefined || score === undefined) {
      res.status(400).json({ success: false, message: 'questionOrder y score son requeridos' });
      return;
    }

    const attempt = await examEvaluationService.evaluateAnswer(attemptId, questionOrder, score, feedback);
    res.json({ success: true, data: attempt, message: 'Respuesta evaluada' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/exam-attempts/:attemptId/complete-evaluation */
export const completeEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const attempt = await examEvaluationService.completeEvaluation(attemptId);

    res.json({
      success: true,
      data: attempt,
      message: attempt.passed
        ? `Examen aprobado (${attempt.percentage}%)`
        : `Examen no aprobado (${attempt.percentage}%)`,
    });
  } catch (error) { next(error); }
};

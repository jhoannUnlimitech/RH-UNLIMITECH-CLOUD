import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { startExam, saveCache, submitExam, getAttempt } from '../../controllers/training/examAttempt.controller';
import { getPendingEvaluations, evaluateAnswer, completeEvaluation } from '../../controllers/training/examEvaluation.controller';

/**
 * Exam Attempts Routes — Tomar exámenes + evaluación manual.
 * Base: /api/v1/training/exam-attempts
 */

const router = Router();

// Admin: evaluación manual de preguntas open_text (ANTES de /:attemptId)
router.get('/pending-evaluation', authMiddleware, requirePermission('training', 'manage'), getPendingEvaluations);

// Empleado: tomar exámenes
router.post('/:examId/start', authMiddleware, requirePermission('training', 'read'), startExam);
router.put('/:attemptId/cache', authMiddleware, requirePermission('training', 'read'), saveCache);
router.put('/:attemptId/submit', authMiddleware, requirePermission('training', 'read'), submitExam);
router.get('/:attemptId', authMiddleware, requirePermission('training', 'read'), getAttempt);

// Admin: evaluar respuestas individuales + completar evaluación
router.put('/:attemptId/evaluate', authMiddleware, requirePermission('training', 'manage'), evaluateAnswer);
router.put('/:attemptId/complete-evaluation', authMiddleware, requirePermission('training', 'manage'), completeEvaluation);

export default router;

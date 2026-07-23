import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { startExam, saveCache, submitExam, getAttempt } from '../../controllers/training/examAttempt.controller';

/**
 * Exam Attempts Routes — Tomar exámenes.
 * Base: /api/v1/training/exam-attempts
 *
 * Permisos: training:read (tomar exámenes es para todos los empleados)
 */

const router = Router();

router.post('/:examId/start', authMiddleware, requirePermission('training', 'read'), startExam);
router.put('/:attemptId/cache', authMiddleware, requirePermission('training', 'read'), saveCache);
router.put('/:attemptId/submit', authMiddleware, requirePermission('training', 'read'), submitExam);
router.get('/:attemptId', authMiddleware, requirePermission('training', 'read'), getAttempt);

export default router;

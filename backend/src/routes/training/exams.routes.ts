import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import { createExamSchema, updateExamSchema, reorderQuestionsSchema } from '../../validators/training/exam.validator';
import { getExams, getExamById, createExam, updateExam, reorderQuestions, deleteExam } from '../../controllers/training/exam.controller';

/**
 * Exam Routes — Exámenes del módulo Training.
 * Base: /api/v1/training/exams
 */

const router = Router();

router.get('/', authMiddleware, requirePermission('training', 'read'), getExams);
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getExamById);
router.post('/', authMiddleware, requirePermission('training', 'create'), validate(createExamSchema), createExam);
router.put('/:id', authMiddleware, requirePermission('training', 'update'), validate(updateExamSchema), updateExam);
router.put('/:id/reorder-questions', authMiddleware, requirePermission('training', 'update'), validate(reorderQuestionsSchema), reorderQuestions);
router.delete('/:id', authMiddleware, requirePermission('training', 'delete'), deleteExam);

export default router;

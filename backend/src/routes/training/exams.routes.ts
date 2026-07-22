import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import { createExamSchema, updateExamSchema, reorderQuestionsSchema } from '../../validators/training/exam.validator';
import { getExams, getMyExams, getExamById, createExam, updateExam, reorderQuestions, deleteExam, assignExam } from '../../controllers/training/exam.controller';

/**
 * Exam Routes — Exámenes del módulo Training.
 * Base: /api/v1/training/exams
 *
 * Permisos:
 *   - read: ver exámenes asignados, tomar exámenes (todos los empleados)
 *   - manage: crear, editar, asignar, eliminar (admin training)
 */

const router = Router();

// Empleado: mis exámenes asignados (read)
router.get('/me', authMiddleware, requirePermission('training', 'read'), getMyExams);

// Lectura general (read)
router.get('/', authMiddleware, requirePermission('training', 'read'), getExams);
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getExamById);

// Gestión (manage)
router.post('/', authMiddleware, requirePermission('training', 'manage'), validate(createExamSchema), createExam);
router.put('/:id', authMiddleware, requirePermission('training', 'manage'), validate(updateExamSchema), updateExam);
router.put('/:id/reorder-questions', authMiddleware, requirePermission('training', 'manage'), validate(reorderQuestionsSchema), reorderQuestions);
router.post('/:id/assign/:employeeId', authMiddleware, requirePermission('training', 'manage'), assignExam);
router.delete('/:id', authMiddleware, requirePermission('training', 'manage'), deleteExam);

export default router;

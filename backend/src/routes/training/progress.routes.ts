import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getMyProgress, getProgressByEmployee, completeCourse } from '../../controllers/training/progress.controller';

/**
 * Progress Routes — Progreso de capacitación del módulo Training.
 * Base: /api/v1/training/progress
 */

const router = Router();

// Mi progreso (cualquier empleado autenticado con training:read)
router.get('/me', authMiddleware, requirePermission('training', 'read'), getMyProgress);

// Completar un curso (empleado marca como terminado)
router.post('/complete-course/:courseId', authMiddleware, requirePermission('training', 'read'), completeCourse);

// Progreso de un empleado específico (admin con training:manage)
router.get('/:employeeId', authMiddleware, requirePermission('training', 'manage'), getProgressByEmployee);

export default router;

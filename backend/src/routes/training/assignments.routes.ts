import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getMyAssignments, getAllAssignments, createAssignment, completeAssignment, deleteAssignment } from '../../controllers/training/assignment.controller';

/**
 * Assignment Routes — Asignaciones extraordinarias.
 * Base: /api/v1/training/assignments
 */

const router = Router();

// Empleado: mis asignaciones pendientes (ordenadas por prioridad)
router.get('/me', authMiddleware, requirePermission('training', 'read'), getMyAssignments);

// Admin: todas las asignaciones
router.get('/', authMiddleware, requirePermission('training', 'manage'), getAllAssignments);

// Admin: crear asignación
router.post('/', authMiddleware, requirePermission('training', 'manage'), createAssignment);

// Empleado: marcar como completada
router.post('/:id/complete', authMiddleware, requirePermission('training', 'read'), completeAssignment);

// Admin: eliminar asignación
router.delete('/:id', authMiddleware, requirePermission('training', 'manage'), deleteAssignment);

export default router;

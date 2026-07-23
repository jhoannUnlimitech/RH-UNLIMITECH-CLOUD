import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getWeeklyAttendance, markBulk, markOne } from '../../controllers/training/attendance.controller';

const router = Router();

// Admin: ver pase de lista semanal
router.get('/', authMiddleware, requirePermission('training', 'manage'), getWeeklyAttendance);

// Admin: marcar asistencia en bulk (todos los empleados de un día)
router.post('/bulk', authMiddleware, requirePermission('training', 'manage'), markBulk);

// Admin: marcar asistencia individual (toggle un empleado)
router.post('/mark', authMiddleware, requirePermission('training', 'manage'), markOne);

export default router;

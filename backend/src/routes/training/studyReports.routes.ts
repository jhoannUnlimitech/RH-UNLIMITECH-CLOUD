import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { createReport, getMyReports, getAttendance } from '../../controllers/training/studyReport.controller';

const router = Router();

// Empleado: reportar + ver mis reportes
router.post('/', authMiddleware, requirePermission('training', 'report'), createReport);
router.get('/me', authMiddleware, requirePermission('training', 'report'), getMyReports);

// Admin: pase de lista semanal
router.get('/attendance', authMiddleware, requirePermission('training', 'manage'), getAttendance);

export default router;

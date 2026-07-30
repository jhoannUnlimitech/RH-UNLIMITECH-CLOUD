import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getOverview, getLevelDistribution, getWeeklyStudyHours, getAlerts, getEmployeeDetail } from '../../controllers/training/dashboard.controller';

const router = Router();

// Solo training:manage puede ver el dashboard admin
router.get('/overview', authMiddleware, requirePermission('training', 'manage'), getOverview);
router.get('/by-level', authMiddleware, requirePermission('training', 'manage'), getLevelDistribution);
router.get('/study-hours', authMiddleware, requirePermission('training', 'manage'), getWeeklyStudyHours);
router.get('/alerts', authMiddleware, requirePermission('training', 'manage'), getAlerts);
router.get('/employee/:id', authMiddleware, requirePermission('training', 'manage'), getEmployeeDetail);

export default router;

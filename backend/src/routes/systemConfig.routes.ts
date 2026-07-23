import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import {
  getConfig,
  updateGeneral,
  updateSchedule,
  updateTraining,
  updateNotifications,
  addHoliday,
  removeHoliday,
} from '../controllers/systemConfig.controller';

const router = Router();

// Todos los autenticados pueden leer la configuración (timezone, locale, etc.)
router.get('/', authMiddleware, getConfig);

// Solo admins/training managers pueden modificar
router.put('/general', authMiddleware, requirePermission('training', 'manage'), updateGeneral);
router.put('/schedule', authMiddleware, requirePermission('training', 'manage'), updateSchedule);
router.put('/training', authMiddleware, requirePermission('training', 'manage'), updateTraining);
router.put('/notifications', authMiddleware, requirePermission('training', 'manage'), updateNotifications);
router.post('/holidays', authMiddleware, requirePermission('training', 'manage'), addHoliday);
router.delete('/holidays/:id', authMiddleware, requirePermission('training', 'manage'), removeHoliday);

export default router;

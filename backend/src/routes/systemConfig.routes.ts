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

// Solo admins pueden modificar (requiere permiso en 'system_config')
// Si no existe aún el permiso, usamos 'roles' con action 'update' como proxy de admin
router.put('/general', authMiddleware, requirePermission('roles', 'update'), updateGeneral);
router.put('/schedule', authMiddleware, requirePermission('roles', 'update'), updateSchedule);
router.put('/training', authMiddleware, requirePermission('roles', 'update'), updateTraining);
router.put('/notifications', authMiddleware, requirePermission('roles', 'update'), updateNotifications);
router.post('/holidays', authMiddleware, requirePermission('roles', 'update'), addHoliday);
router.delete('/holidays/:id', authMiddleware, requirePermission('roles', 'update'), removeHoliday);

export default router;

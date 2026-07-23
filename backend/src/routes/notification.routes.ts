import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';

/**
 * Notification Routes — Notificaciones del empleado autenticado.
 * Base: /api/v1/notifications
 */

const router = Router();

router.get('/', authMiddleware, getMyNotifications);
router.put('/read-all', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);

export default router;

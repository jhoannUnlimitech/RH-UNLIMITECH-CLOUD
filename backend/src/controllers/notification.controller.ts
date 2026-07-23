import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

/**
 * Notification Controller — Endpoints para notificaciones del empleado.
 */

/** GET /api/v1/notifications */
export const getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const notifications = await notificationService.getByEmployee(req.user!.id, limit);
    const unreadCount = await notificationService.getUnreadCount(req.user!.id);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/notifications/:id/read */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/notifications/read-all */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

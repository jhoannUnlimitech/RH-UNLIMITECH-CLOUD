import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { systemConfigService } from '../services/systemConfig.service';

/**
 * SystemConfigController — CRUD de la configuración general del sistema.
 */

/** GET /api/v1/config — Obtener toda la configuración */
export const getConfig = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.getConfig();
    res.json({ success: true, data: config });
  } catch (error) { next(error); }
};

/** PUT /api/v1/config/general — Actualizar sección general */
export const updateGeneral = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.updateGeneral(req.user!.id, req.body);
    res.json({ success: true, data: config, message: 'Configuración general actualizada' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/config/schedule — Actualizar sección de horario */
export const updateSchedule = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.updateSchedule(req.user!.id, req.body);
    res.json({ success: true, data: config, message: 'Horario actualizado' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/config/training — Actualizar sección de training */
export const updateTraining = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.updateTraining(req.user!.id, req.body);
    res.json({ success: true, data: config, message: 'Configuración de training actualizada' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/config/notifications — Actualizar sección de notificaciones */
export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.updateNotifications(req.user!.id, req.body);
    res.json({ success: true, data: config, message: 'Configuración de notificaciones actualizada' });
  } catch (error) { next(error); }
};

/** POST /api/v1/config/holidays — Agregar un festivo */
export const addHoliday = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.addHoliday(req.user!.id, req.body);
    res.json({ success: true, data: config, message: 'Festivo agregado' });
  } catch (error) { next(error); }
};

/** DELETE /api/v1/config/holidays/:id — Eliminar un festivo */
export const removeHoliday = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await systemConfigService.removeHoliday(req.user!.id, req.params.id);
    res.json({ success: true, data: config, message: 'Festivo eliminado' });
  } catch (error) { next(error); }
};

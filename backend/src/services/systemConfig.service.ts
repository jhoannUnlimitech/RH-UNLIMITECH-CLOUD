import { SystemConfig, ISystemConfig, IHoliday } from '../models/SystemConfig';

/**
 * SystemConfigService — Gestión de la configuración global del sistema (singleton).
 *
 * El config se carga una vez y se cachea en memoria. Se invalida al actualizar.
 * Todos los módulos que necesiten config del sistema llaman a getConfig().
 */

let cachedConfig: ISystemConfig | null = null;

class SystemConfigService {

  /**
   * Obtener la configuración del sistema.
   * Crea el documento con defaults si no existe (singleton).
   */
  async getConfig(): Promise<ISystemConfig> {
    if (cachedConfig) return cachedConfig;

    let config = await SystemConfig.findOne();
    if (!config) {
      // Crear con defaults
      config = await SystemConfig.create({});
    }

    cachedConfig = config;
    return config;
  }

  /**
   * Actualizar configuración general.
   */
  async updateGeneral(userId: string, data: Partial<ISystemConfig['general']>): Promise<ISystemConfig> {
    const config = await this.getConfig();
    Object.assign(config.general, data);
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Actualizar configuración de horario/jornada.
   */
  async updateSchedule(userId: string, data: Partial<ISystemConfig['schedule']>): Promise<ISystemConfig> {
    const config = await this.getConfig();

    // Validar días válidos (0-6)
    if (data.workDays) {
      if (!data.workDays.every(d => d >= 0 && d <= 6)) {
        throw new Error('Días laborales inválidos. Usar 0=Dom, 1=Lun, ..., 6=Sáb');
      }
    }
    if (data.studyDays) {
      if (!data.studyDays.every(d => d >= 0 && d <= 6)) {
        throw new Error('Días de estudio inválidos. Usar 0=Dom, 1=Lun, ..., 6=Sáb');
      }
    }

    Object.assign(config.schedule, data);
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Actualizar configuración de training.
   */
  async updateTraining(userId: string, data: Partial<ISystemConfig['training']>): Promise<ISystemConfig> {
    const config = await this.getConfig();

    if (data.minWeeklyHours !== undefined && (data.minWeeklyHours < 0 || data.minWeeklyHours > 40)) {
      throw new Error('Mínimo de horas semanales debe estar entre 0 y 40');
    }
    if (data.examPassingScore !== undefined && (data.examPassingScore < 1 || data.examPassingScore > 100)) {
      throw new Error('Porcentaje de aprobación debe estar entre 1 y 100');
    }

    Object.assign(config.training, data);
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Actualizar configuración de notificaciones.
   */
  async updateNotifications(userId: string, data: Partial<ISystemConfig['notifications']>): Promise<ISystemConfig> {
    const config = await this.getConfig();
    Object.assign(config.notifications, data);
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Agregar un festivo.
   */
  async addHoliday(userId: string, holiday: IHoliday): Promise<ISystemConfig> {
    const config = await this.getConfig();

    // Verificar duplicado
    const exists = config.holidays.some(h =>
      h.date === holiday.date && h.name === holiday.name
    );
    if (exists) throw new Error('Este festivo ya existe');

    config.holidays.push(holiday);
    config.holidays.sort((a, b) => a.date.localeCompare(b.date));
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Eliminar un festivo por su ID.
   */
  async removeHoliday(userId: string, holidayId: string): Promise<ISystemConfig> {
    const config = await this.getConfig();
    config.holidays = config.holidays.filter(h => (h as any)._id.toString() !== holidayId);
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Reemplazar todos los festivos (bulk update).
   */
  async setHolidays(userId: string, holidays: IHoliday[]): Promise<ISystemConfig> {
    const config = await this.getConfig();
    config.holidays = holidays;
    config.holidays.sort((a, b) => a.date.localeCompare(b.date));
    config.updatedBy = userId as any;
    await config.save();
    cachedConfig = config;
    return config;
  }

  /**
   * Verificar si una fecha es festivo.
   * Lee directamente del módulo de calendario (CalendarEvent type='holiday').
   */
  async isHoliday(date: Date): Promise<boolean> {
    const { CalendarEvent } = await import('../models/CalendarEvent');
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const holiday = await CalendarEvent.findOne({
      type: 'holiday',
      startDate: { $lte: dateEnd },
      endDate: { $gte: dateStart },
    });

    return !!holiday;
  }

  /**
   * Obtener los días obligatorios de estudio.
   */
  async getStudyDays(): Promise<number[]> {
    const config = await this.getConfig();
    return config.schedule.studyDays;
  }

  /**
   * Obtener la timezone del sistema.
   */
  async getTimezone(): Promise<string> {
    const config = await this.getConfig();
    return config.general.timezone;
  }

  /**
   * Invalidar cache (útil para tests o forzar recarga).
   */
  invalidateCache(): void {
    cachedConfig = null;
  }
}

export const systemConfigService = new SystemConfigService();

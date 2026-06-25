import { Response, NextFunction } from 'express';
import { CalendarEvent } from '../models/CalendarEvent';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * Obtener eventos (con filtros opcionales)
 * GET /api/v1/calendar/events?type=meeting&from=2026-06-01&to=2026-06-30
 */
export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, from, to } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (from || to) {
      filter.startDate = {};
      if (from) filter.startDate.$gte = new Date(from as string);
      if (to) filter.startDate.$lte = new Date(to as string);
    }

    const events = await CalendarEvent.find(filter)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.json({ success: true, data: events });
  } catch (error) { next(error); }
};

/**
 * Obtener evento por ID
 */
export const getEventById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) throw new AppError('Evento no encontrado', 404);

    res.json({ success: true, data: event });
  } catch (error) { next(error); }
};

/**
 * Crear evento
 * POST /api/v1/calendar/events
 */
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, startDate, endDate, color, type, allDay } = req.body;

    const event = new CalendarEvent({
      title,
      description,
      startDate,
      endDate,
      color: color || 'primary',
      type: type || 'other',
      allDay: allDay !== undefined ? allDay : true,
      createdBy: req.user!.id,
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: event, message: 'Evento creado exitosamente' });
  } catch (error) { next(error); }
};

/**
 * Actualizar evento
 */
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) throw new AppError('Evento no encontrado', 404);

    const { title, description, startDate, endDate, color, type, allDay } = req.body;
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (color) event.color = color;
    if (type) event.type = type;
    if (allDay !== undefined) event.allDay = allDay;

    await event.save();
    await event.populate('createdBy', 'name email');

    res.json({ success: true, data: event, message: 'Evento actualizado exitosamente' });
  } catch (error) { next(error); }
};

/**
 * Eliminar evento
 */
export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) throw new AppError('Evento no encontrado', 404);

    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Evento eliminado exitosamente' });
  } catch (error) { next(error); }
};

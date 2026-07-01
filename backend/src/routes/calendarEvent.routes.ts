import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/calendarEvent.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../validators/calendarEvent.validator';

const router = Router();
router.use(authMiddleware);

// Todos pueden ver eventos
router.get('/', getEvents);
router.get('/:id', getEventById);

// Solo HR/CEO/Founder pueden crear/editar/eliminar
router.post('/', requirePermission('employees', 'update'), validate(createEventSchema), createEvent);
router.put('/:id', requirePermission('employees', 'update'), validate(updateEventSchema), updateEvent);
router.delete('/:id', requirePermission('employees', 'update'), deleteEvent);

export default router;

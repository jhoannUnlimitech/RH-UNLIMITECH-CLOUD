import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/calendarEvent.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();
router.use(authMiddleware);

// Todos pueden ver eventos
router.get('/', getEvents);
router.get('/:id', getEventById);

// Solo HR/CEO/Founder pueden crear/editar/eliminar
router.post('/', requirePermission('employees', 'update'), createEvent);
router.put('/:id', requirePermission('employees', 'update'), updateEvent);
router.delete('/:id', requirePermission('employees', 'update'), deleteEvent);

export default router;

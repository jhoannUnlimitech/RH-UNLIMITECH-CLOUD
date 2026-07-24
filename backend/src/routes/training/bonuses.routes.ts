import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import {
  getRanges, createRange, updateRange, deleteRange,
  calculateBonuses, getQuarterBonuses, getPendingBonuses, markAsPaid, getMyBonuses,
} from '../../controllers/training/bonus.controller';

const router = Router();

// Empleado: ver mis bonos
router.get('/me', authMiddleware, requirePermission('training', 'read'), getMyBonuses);

// Todos: ver rangos de bonificación
router.get('/ranges', authMiddleware, requirePermission('training', 'read'), getRanges);

// Admin: CRUD de rangos
router.post('/ranges', authMiddleware, requirePermission('training', 'manage'), createRange);
router.put('/ranges/:id', authMiddleware, requirePermission('training', 'manage'), updateRange);
router.delete('/ranges/:id', authMiddleware, requirePermission('training', 'manage'), deleteRange);

// Admin: calcular bonos trimestrales
router.post('/calculate', authMiddleware, requirePermission('training', 'manage'), calculateBonuses);

// Admin: ver bonos por trimestre
router.get('/quarter/:year/:quarter', authMiddleware, requirePermission('training', 'manage'), getQuarterBonuses);

// Admin: ver bonos pendientes de pago
router.get('/pending', authMiddleware, requirePermission('training', 'manage'), getPendingBonuses);

// Admin: marcar como pagado
router.put('/:id/pay', authMiddleware, requirePermission('training', 'manage'), markAsPaid);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getCurrentHonorTable, getHonorTable } from '../../controllers/training/honorTable.controller';

const router = Router();

// Todos con permiso de training pueden ver la tabla de honor
router.get('/current', authMiddleware, requirePermission('training', 'read'), getCurrentHonorTable);
router.get('/:year/:quarter', authMiddleware, requirePermission('training', 'read'), getHonorTable);

export default router;

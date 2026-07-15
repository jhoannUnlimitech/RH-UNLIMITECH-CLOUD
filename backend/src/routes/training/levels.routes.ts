import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import { createLevelSchema, updateLevelSchema, reorderLevelsSchema } from '../../validators/training/level.validator';
import { getLevels, getLevelById, createLevel, updateLevel, reorderLevels, deleteLevel } from '../../controllers/training/level.controller';

/**
 * Level Routes — Niveles del módulo Training.
 * Base: /api/v1/training/levels
 */

const router = Router();

router.get('/', authMiddleware, requirePermission('training', 'read'), getLevels);
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getLevelById);
router.post('/', authMiddleware, requirePermission('training', 'create'), validate(createLevelSchema), createLevel);
router.put('/reorder', authMiddleware, requirePermission('training', 'update'), validate(reorderLevelsSchema), reorderLevels);
router.put('/:id', authMiddleware, requirePermission('training', 'update'), validate(updateLevelSchema), updateLevel);
router.delete('/:id', authMiddleware, requirePermission('training', 'delete'), deleteLevel);

export default router;

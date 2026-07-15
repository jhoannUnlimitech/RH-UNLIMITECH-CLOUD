import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import { createBadgeSchema, updateBadgeSchema } from '../../validators/training/badge.validator';
import { getBadges, getBadgeById, createBadge, updateBadge, deleteBadge } from '../../controllers/training/badge.controller';

/**
 * Badge Routes — Insignias del módulo Training.
 * Base: /api/v1/training/badges
 */

const router = Router();

router.get('/', authMiddleware, requirePermission('training', 'read'), getBadges);
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getBadgeById);
router.post('/', authMiddleware, requirePermission('training', 'create'), validate(createBadgeSchema), createBadge);
router.put('/:id', authMiddleware, requirePermission('training', 'update'), validate(updateBadgeSchema), updateBadge);
router.delete('/:id', authMiddleware, requirePermission('training', 'delete'), deleteBadge);

export default router;

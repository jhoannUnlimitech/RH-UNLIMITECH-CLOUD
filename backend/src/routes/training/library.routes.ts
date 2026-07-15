import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import {
  createLibraryCategorySchema,
  updateLibraryCategorySchema,
  reorderLibraryCategoriesSchema,
} from '../../validators/training/libraryCategory.validator';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
} from '../../controllers/training/libraryCategory.controller';

/**
 * Library Routes — Categorías de la Biblioteca documental.
 *
 * Base: /api/v1/library/categories
 * Permisos: training:read (lectura), training:create/update/delete (escritura)
 */

const router = Router();

// ─── Categorías ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/library/categories
 * @desc    Listar categorías. ?parent=root para raíces, ?parent=:id para hijos
 * @access  Private (training:read)
 */
router.get(
  '/categories',
  authMiddleware,
  requirePermission('training', 'read'),
  getCategories
);

/**
 * @route   GET /api/v1/library/categories/:id
 * @desc    Obtener categoría por ID con sus hijos directos
 * @access  Private (training:read)
 */
router.get(
  '/categories/:id',
  authMiddleware,
  requirePermission('training', 'read'),
  getCategoryById
);

/**
 * @route   POST /api/v1/library/categories
 * @desc    Crear nueva categoría
 * @access  Private (training:create)
 */
router.post(
  '/categories',
  authMiddleware,
  requirePermission('training', 'create'),
  validate(createLibraryCategorySchema),
  createCategory
);

/**
 * @route   PUT /api/v1/library/categories/reorder
 * @desc    Reordenar categorías (batch update de order)
 * @access  Private (training:update)
 */
router.put(
  '/categories/reorder',
  authMiddleware,
  requirePermission('training', 'update'),
  validate(reorderLibraryCategoriesSchema),
  reorderCategories
);

/**
 * @route   PUT /api/v1/library/categories/:id
 * @desc    Actualizar categoría
 * @access  Private (training:update)
 */
router.put(
  '/categories/:id',
  authMiddleware,
  requirePermission('training', 'update'),
  validate(updateLibraryCategorySchema),
  updateCategory
);

/**
 * @route   DELETE /api/v1/library/categories/:id
 * @desc    Eliminar categoría (soft delete)
 * @access  Private (training:delete)
 */
router.delete(
  '/categories/:id',
  authMiddleware,
  requirePermission('training', 'delete'),
  deleteCategory
);

export default router;

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
  createLibraryDocumentSchema,
  updateLibraryDocumentSchema,
  publishDocumentSchema,
  featureDocumentSchema,
} from '../../validators/training/libraryDocument.validator';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
} from '../../controllers/training/libraryCategory.controller';
import {
  getDocuments,
  getDocumentBySlug,
  createDocument,
  updateDocument,
  publishDocument,
  featureDocument,
  registerView,
  getVersions,
  getVersion,
  restoreVersion,
  deleteDocument,
  searchDocuments,
} from '../../controllers/training/libraryDocument.controller';

/**
 * Library Routes — Biblioteca documental (categorías + documentos).
 *
 * Base: /api/v1/library
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

// ─── Documentos ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/library/search
 * @desc    Búsqueda de documentos por título y tags
 * @access  Private (training:read)
 */
router.get(
  '/search',
  authMiddleware,
  requirePermission('training', 'read'),
  searchDocuments
);

/**
 * @route   GET /api/v1/library/documents
 * @desc    Listar documentos con filtros y paginación
 * @access  Private (training:read)
 */
router.get(
  '/documents',
  authMiddleware,
  requirePermission('training', 'read'),
  getDocuments
);

/**
 * @route   GET /api/v1/library/documents/:slug
 * @desc    Obtener documento por slug
 * @access  Private (training:read)
 */
router.get(
  '/documents/:slug',
  authMiddleware,
  requirePermission('training', 'read'),
  getDocumentBySlug
);

/**
 * @route   GET /api/v1/library/documents/:id/versions
 * @desc    Historial de versiones de un documento
 * @access  Private (training:manage)
 */
router.get(
  '/documents/:id/versions',
  authMiddleware,
  requirePermission('training', 'update'),
  getVersions
);

/**
 * @route   GET /api/v1/library/documents/:id/versions/:version
 * @desc    Obtener versión específica de un documento
 * @access  Private (training:manage)
 */
router.get(
  '/documents/:id/versions/:version',
  authMiddleware,
  requirePermission('training', 'update'),
  getVersion
);

/**
 * @route   POST /api/v1/library/documents
 * @desc    Crear nuevo documento
 * @access  Private (training:create)
 */
router.post(
  '/documents',
  authMiddleware,
  requirePermission('training', 'create'),
  validate(createLibraryDocumentSchema),
  createDocument
);

/**
 * @route   PUT /api/v1/library/documents/:id
 * @desc    Actualizar documento (crea nueva versión si content cambió)
 * @access  Private (training:update)
 */
router.put(
  '/documents/:id',
  authMiddleware,
  requirePermission('training', 'update'),
  validate(updateLibraryDocumentSchema),
  updateDocument
);

/**
 * @route   PUT /api/v1/library/documents/:id/publish
 * @desc    Publicar o despublicar documento
 * @access  Private (training:manage)
 */
router.put(
  '/documents/:id/publish',
  authMiddleware,
  requirePermission('training', 'update'),
  validate(publishDocumentSchema),
  publishDocument
);

/**
 * @route   PUT /api/v1/library/documents/:id/feature
 * @desc    Destacar o quitar de destacados
 * @access  Private (training:manage)
 */
router.put(
  '/documents/:id/feature',
  authMiddleware,
  requirePermission('training', 'update'),
  validate(featureDocumentSchema),
  featureDocument
);

/**
 * @route   POST /api/v1/library/documents/:id/view
 * @desc    Registrar vista de un documento
 * @access  Private (training:read)
 */
router.post(
  '/documents/:id/view',
  authMiddleware,
  requirePermission('training', 'read'),
  registerView
);

/**
 * @route   POST /api/v1/library/documents/:id/restore-version/:version
 * @desc    Restaurar versión anterior de un documento
 * @access  Private (training:manage)
 */
router.post(
  '/documents/:id/restore-version/:version',
  authMiddleware,
  requirePermission('training', 'update'),
  restoreVersion
);

/**
 * @route   DELETE /api/v1/library/documents/:id
 * @desc    Eliminar documento (soft delete)
 * @access  Private (training:delete)
 */
router.delete(
  '/documents/:id',
  authMiddleware,
  requirePermission('training', 'delete'),
  deleteDocument
);

export default router;

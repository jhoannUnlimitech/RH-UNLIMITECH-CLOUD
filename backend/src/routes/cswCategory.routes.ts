import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import {
  getCSWCategories,
  getAllCSWCategories,
  getCSWCategoryById,
  createCSWCategory,
  updateCSWCategory,
  deleteCSWCategory
} from '../controllers/cswCategory.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CSWCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Nombre de la categoría
 *           example: "Permiso"
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Descripción de la categoría
 *           example: "Solicitud de permiso laboral"
 *           maxLength: 500
 *         active:
 *           type: boolean
 *           description: Si la categoría está activa
 *           default: true
 *         order:
 *           type: number
 *           description: Orden de visualización
 *           default: 0
 *         requiresAttachment:
 *           type: boolean
 *           description: Si requiere adjuntar archivo
 *           default: false
 *         deleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/csw-categories:
 *   get:
 *     summary: Obtener categorías CSW activas
 *     description: Lista todas las categorías activas ordenadas para usar en formularios
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CSWCategory'
 *                 message:
 *                   type: string
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('csw_categories', 'read'),
  getCSWCategories
);

/**
 * @swagger
 * /api/v1/csw-categories/all:
 *   get:
 *     summary: Obtener todas las categorías (admin)
 *     description: Lista todas las categorías incluidas las inactivas
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de categorías
 */
router.get(
  '/all',
  authMiddleware,
  requirePermission('csw_categories', 'read'),
  getAllCSWCategories
);

/**
 * @swagger
 * /api/v1/csw-categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('csw_categories', 'read'),
  getCSWCategoryById
);

/**
 * @swagger
 * /api/v1/csw-categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *               order:
 *                 type: number
 *               requiresAttachment:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('csw_categories', 'create'),
  createCSWCategory
);

/**
 * @swagger
 * /api/v1/csw-categories/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *               order:
 *                 type: number
 *               requiresAttachment:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('csw_categories', 'update'),
  updateCSWCategory
);

/**
 * @swagger
 * /api/v1/csw-categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría (soft delete)
 *     tags: [CSW Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('csw_categories', 'delete'),
  deleteCSWCategory
);

export default router;

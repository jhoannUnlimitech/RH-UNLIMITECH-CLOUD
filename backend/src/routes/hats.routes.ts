import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions
} from '../controllers/hats.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { createHatSchema, updateHatSchema } from '../validators/hat.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /roles/permissions/all:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener todos los permisos disponibles
 *     description: Lista todos los permisos agrupados por recurso
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de permisos
 */
router.get('/permissions/all', requirePermission('roles', 'read'), getAllPermissions);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Listar todos los hats
 *     description: Obtiene lista completa de hats con sus permisos
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de hats
 */
router.get('/', requirePermission('roles', 'read'), getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener hat por ID
 *     description: Retorna detalles del hat con permisos y contador de empleados
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hat encontrado
 *       404:
 *         description: Hat no encontrado
 */
router.get('/:id', requirePermission('roles', 'read'), getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Crear nuevo hat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de permisos
 *     responses:
 *       201:
 *         description: Hat creado
 */
router.post('/', requirePermission('roles', 'create'), validate(createHatSchema), createRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Actualizar hat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Hat actualizado
 */
router.put('/:id', requirePermission('roles', 'update'), validate(updateHatSchema), updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Eliminar hat
 *     description: Solo si no tiene empleados asignados
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hat eliminado
 *       400:
 *         description: No se puede eliminar, tiene empleados asignados
 */
router.delete('/:id', requirePermission('roles', 'delete'), deleteRole);

export default router;

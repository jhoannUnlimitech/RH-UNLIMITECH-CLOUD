import { Router } from 'express';
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getResources,
  getActions
} from '../controllers/permissions.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /permissions/resources:
 *   get:
 *     tags: [Permissions]
 *     summary: Obtener todos los recursos únicos
 *     description: Lista todos los recursos (módulos) del sistema
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de recursos
 */
router.get('/resources', requirePermission('roles', 'read'), getResources);

/**
 * @swagger
 * /permissions/actions:
 *   get:
 *     tags: [Permissions]
 *     summary: Obtener todas las acciones únicas
 *     description: Lista todas las acciones disponibles (read, create, update, delete, etc.)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de acciones
 */
router.get('/actions', requirePermission('roles', 'read'), getActions);

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Listar todos los permisos
 *     description: Obtiene lista completa de permisos disponibles en el sistema
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       resource:
 *                         type: string
 *                       action:
 *                         type: string
 *                 grouped:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 */
router.get('/', requirePermission('roles', 'read'), getPermissions);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Obtener permiso por ID
 *     description: Obtiene un permiso específico
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
 *         description: Permiso encontrado
 *       404:
 *         description: Permiso no encontrado
 */
router.get('/:id', requirePermission('roles', 'read'), getPermissionById);

/**
 * @swagger
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Crear un nuevo permiso
 *     description: Crea un nuevo permiso en el sistema
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
 *               - resource
 *               - action
 *             properties:
 *               resource:
 *                 type: string
 *                 example: employees
 *               action:
 *                 type: string
 *                 example: read
 *     responses:
 *       201:
 *         description: Permiso creado exitosamente
 *       400:
 *         description: Permiso ya existe o datos inválidos
 */
router.post('/', requirePermission('roles', 'create'), createPermission);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     tags: [Permissions]
 *     summary: Actualizar un permiso
 *     description: Actualiza un permiso existente
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
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permiso actualizado exitosamente
 *       404:
 *         description: Permiso no encontrado
 */
router.put('/:id', requirePermission('roles', 'update'), updatePermission);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Eliminar un permiso
 *     description: Elimina un permiso del sistema (solo si no está siendo usado)
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
 *         description: Permiso eliminado exitosamente
 *       400:
 *         description: Permiso está siendo usado
 *       404:
 *         description: Permiso no encontrado
 */
router.delete('/:id', requirePermission('roles', 'delete'), deletePermission);

export default router;

import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions
} from '../controllers/roles.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

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
 *     summary: Listar todos los roles
 *     description: Obtiene lista completa de roles con sus permisos
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get('/', requirePermission('roles', 'read'), getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener rol por ID
 *     description: Retorna detalles del rol con permisos y contador de empleados
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
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 */
router.get('/:id', requirePermission('roles', 'read'), getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Crear nuevo rol
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
 *         description: Rol creado
 */
router.post('/', requirePermission('roles', 'create'), createRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Actualizar rol
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
 *         description: Rol actualizado
 */
router.put('/:id', requirePermission('roles', 'update'), updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Eliminar rol
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
 *         description: Rol eliminado
 *       400:
 *         description: No se puede eliminar, tiene empleados asignados
 */
router.delete('/:id', requirePermission('roles', 'delete'), deleteRole);

export default router;

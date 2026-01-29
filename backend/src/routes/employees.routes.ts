import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeePhoto,
  deleteEmployee,
  restoreEmployee,
  getEmployeeStats
} from '../controllers/employees.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /employees/stats:
 *   get:
 *     tags: [Employees]
 *     summary: Obtener estadísticas de empleados
 *     description: Retorna estadísticas generales de empleados por división y rol
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     byDivision:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: number
 *                     byRole:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: number
 */
router.get('/stats', requirePermission('employees', 'read'), getEmployeeStats);

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employees]
 *     summary: Listar empleados
 *     description: Obtiene lista de empleados con filtros y paginación
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Registros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, email o cédula
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por ID de rol
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filtrar por ID de división
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de empleados obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 */
router.get('/', requirePermission('employees', 'read'), getEmployees);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Obtener empleado por ID
 *     description: Retorna los detalles de un empleado específico
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
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/:id', requirePermission('employees', 'read'), getEmployeeById);

/**
 * @swagger
 * /employees:
 *   post:
 *     tags: [Employees]
 *     summary: Crear nuevo empleado
 *     description: Crea un nuevo empleado en el sistema
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
 *               - email
 *               - password
 *               - role
 *               - division
 *               - birthDate
 *               - nationalId
 *               - phone
 *               - nationality
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               division:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationalId:
 *                 type: string
 *               phone:
 *                 type: string
 *               nationality:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               emergencyPhone:
 *                 type: string
 *               photo:
 *                 type: string
 *                 description: Foto en formato base64
 *               managerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', requirePermission('employees', 'create'), createEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Actualizar empleado
 *     description: Actualiza los datos de un empleado existente
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
 *         description: ID del empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               division:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               emergencyPhone:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empleado actualizado exitosamente
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id', requirePermission('employees', 'update'), updateEmployee);

/**
 * @swagger
 * /employees/{id}/photo:
 *   put:
 *     tags: [Employees]
 *     summary: Actualizar foto de empleado
 *     description: Actualiza la foto de perfil de un empleado (base64)
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
 *         description: ID del empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 description: Foto en formato base64 (data:image/[type];base64,...)
 *     responses:
 *       200:
 *         description: Foto actualizada exitosamente
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id/photo', requirePermission('employees', 'update'), updateEmployeePhoto);

/**
 * @swagger
 * /employees/{id}/restore:
 *   put:
 *     tags: [Employees]
 *     summary: Restaurar empleado eliminado
 *     description: Restaura un empleado previamente eliminado (soft delete)
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
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Empleado restaurado exitosamente
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id/restore', requirePermission('employees', 'create'), restoreEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Eliminar empleado
 *     description: Realiza soft delete de un empleado
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
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Empleado eliminado exitosamente
 *       404:
 *         description: Empleado no encontrado
 */
router.delete('/:id', requirePermission('employees', 'delete'), deleteEmployee);

export default router;

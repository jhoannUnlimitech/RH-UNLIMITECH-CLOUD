import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import {
  getApprovalFlows,
  getApprovalFlowById,
  getActiveFlowByDivision,
  createApprovalFlow,
  updateApprovalFlow,
  toggleApprovalFlow,
  deleteApprovalFlow
} from '../controllers/approvalFlow.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ApprovalLevel:
 *       type: object
 *       required:
 *         - order
 *         - name
 *         - approverType
 *         - required
 *       properties:
 *         order:
 *           type: number
 *           description: Orden del nivel (1, 2, 3, ...)
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre descriptivo del nivel
 *           example: "Tech Lead"
 *           maxLength: 100
 *         approverType:
 *           type: string
 *           enum: [role, user]
 *           description: Tipo de aprobador (por rol o usuario específico)
 *           example: "role"
 *         approverRoleId:
 *           type: string
 *           description: ID del rol aprobador (requerido si approverType es 'role')
 *           example: "507f1f77bcf86cd799439011"
 *         approverUserId:
 *           type: string
 *           description: ID del usuario aprobador (requerido si approverType es 'user')
 *           example: "507f1f77bcf86cd799439012"
 *         required:
 *           type: boolean
 *           description: Si este nivel es obligatorio
 *           example: true
 *         autoApprove:
 *           type: boolean
 *           description: Si se auto-aprueba bajo ciertas condiciones
 *           example: false
 *     
 *     ApprovalFlow:
 *       type: object
 *       required:
 *         - divisionId
 *         - name
 *         - levels
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del flujo
 *         divisionId:
 *           type: string
 *           description: ID de la división
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Nombre del flujo
 *           example: "Flujo Tecnología"
 *           maxLength: 150
 *         description:
 *           type: string
 *           description: Descripción del flujo
 *           example: "Flujo de aprobación para solicitudes del área de tecnología"
 *           maxLength: 500
 *         levels:
 *           type: array
 *           description: Niveles de aprobación ordenados
 *           items:
 *             $ref: '#/components/schemas/ApprovalLevel'
 *         active:
 *           type: boolean
 *           description: Si el flujo está activo
 *           example: true
 *         isDefault:
 *           type: boolean
 *           description: Si es el flujo por defecto
 *           example: false
 *         deleted:
 *           type: boolean
 *           description: Si está eliminado (soft delete)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/approval-flows:
 *   get:
 *     summary: Obtener todos los flujos de aprobación
 *     tags: [ApprovalFlows]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de división
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de flujos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/ApprovalFlow'
 *                 message:
 *                   type: string
 */
router.get(
  '/',
  authMiddleware,
  requirePermission('approval_flows:read'),
  getApprovalFlows
);

/**
 * @swagger
 * /api/v1/approval-flows/{id}:
 *   get:
 *     summary: Obtener un flujo por ID
 *     tags: [ApprovalFlows]
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
 *         description: Flujo encontrado
 *       404:
 *         description: Flujo no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('approval_flows:read'),
  getApprovalFlowById
);

/**
 * @swagger
 * /api/v1/approval-flows/by-division/{divisionId}:
 *   get:
 *     summary: Obtener flujo activo de una división
 *     tags: [ApprovalFlows]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flujo activo encontrado
 *       404:
 *         description: No se encontró flujo activo para esta división
 */
router.get(
  '/by-division/:divisionId',
  authMiddleware,
  requirePermission('approval_flows:read'),
  getActiveFlowByDivision
);

/**
 * @swagger
 * /api/v1/approval-flows:
 *   post:
 *     summary: Crear un nuevo flujo de aprobación
 *     tags: [ApprovalFlows]
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
 *               - divisionId
 *               - name
 *               - levels
 *             properties:
 *               divisionId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               levels:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ApprovalLevel'
 *               active:
 *                 type: boolean
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Flujo creado exitosamente
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('approval_flows:create'),
  createApprovalFlow
);

/**
 * @swagger
 * /api/v1/approval-flows/{id}:
 *   put:
 *     summary: Actualizar un flujo de aprobación
 *     tags: [ApprovalFlows]
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
 *               levels:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ApprovalLevel'
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Flujo actualizado exitosamente
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('approval_flows:update'),
  updateApprovalFlow
);

/**
 * @swagger
 * /api/v1/approval-flows/{id}/toggle:
 *   patch:
 *     summary: Activar/Desactivar un flujo
 *     tags: [ApprovalFlows]
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
 *         description: Flujo actualizado exitosamente
 */
router.patch(
  '/:id/toggle',
  authMiddleware,
  requirePermission('approval_flows:update'),
  toggleApprovalFlow
);

/**
 * @swagger
 * /api/v1/approval-flows/{id}:
 *   delete:
 *     summary: Eliminar un flujo (soft delete)
 *     tags: [ApprovalFlows]
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
 *         description: Flujo eliminado exitosamente
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('approval_flows:delete'),
  deleteApprovalFlow
);

export default router;

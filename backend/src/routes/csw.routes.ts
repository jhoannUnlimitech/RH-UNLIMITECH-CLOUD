import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import {
  getCSWs,
  getMyPendingApprovals,
  getMyRequests,
  getCSWById,
  getCSWHistory,
  createCSW,
  updateCSW,
  approveCSW,
  rejectCSW,
  cancelCSW,
  deleteCSW,
  getCSWStats
} from '../controllers/csw.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Approval:
 *       type: object
 *       properties:
 *         level:
 *           type: number
 *           description: Nivel de aprobación
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del nivel
 *           example: "Tech Lead"
 *         approverId:
 *           type: string
 *           description: ID del aprobador
 *         approverName:
 *           type: string
 *           description: Nombre del aprobador
 *           example: "Juan Pérez"
 *         approverPosition:
 *           type: string
 *           description: Cargo del aprobador
 *           example: "Tech Lead"
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Estado de la aprobación
 *           example: "pending"
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         comments:
 *           type: string
 *           maxLength: 1500
 *     
 *     CSWHistory:
 *       type: object
 *       properties:
 *         action:
 *           type: string
 *           description: Acción realizada
 *           example: "approved"
 *         performedBy:
 *           type: string
 *           description: ID del usuario que realizó la acción
 *         performedByName:
 *           type: string
 *           description: Nombre del usuario
 *           example: "María García"
 *         performedAt:
 *           type: string
 *           format: date-time
 *         level:
 *           type: number
 *         previousStatus:
 *           type: string
 *         newStatus:
 *           type: string
 *         comments:
 *           type: string
 *           maxLength: 1500
 *     
 *     CSW:
 *       type: object
 *       required:
 *         - situation
 *         - information
 *         - solution
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: ID de la solicitud
 *         situation:
 *           type: string
 *           description: "¿Qué sucede?"
 *           maxLength: 1500
 *           example: "Necesito ausentarme por cita médica"
 *         information:
 *           type: string
 *           description: "¿Qué datos tienes?"
 *           maxLength: 1500
 *           example: "Cita programada para el 28/01/2026 a las 10:00 AM"
 *         solution:
 *           type: string
 *           description: "¿Cómo se resuelve?"
 *           maxLength: 1500
 *           example: "Mi compañero cubrirá mis tareas durante mi ausencia"
 *         requester:
 *           type: string
 *           description: ID del solicitante
 *         requesterName:
 *           type: string
 *           description: Nombre del solicitante
 *         requesterPosition:
 *           type: string
 *           description: Cargo del solicitante
 *         requesterDivision:
 *           type: string
 *           description: ID de la división del solicitante
 *         category:
 *           type: string
 *           description: ID de la categoría
 *         approvalFlowId:
 *           type: string
 *           description: ID del flujo de aprobación utilizado
 *         approvalChain:
 *           type: array
 *           description: Cadena de aprobación secuencial
 *           items:
 *             $ref: '#/components/schemas/Approval'
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *           description: Estado general de la solicitud
 *           example: "pending"
 *         currentLevel:
 *           type: number
 *           description: Nivel actual esperando aprobación
 *           example: 1
 *         history:
 *           type: array
 *           description: Historial completo de acciones
 *           items:
 *             $ref: '#/components/schemas/CSWHistory'
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
 * /api/v1/csw:
 *   get:
 *     summary: Obtener todas las solicitudes CSW
 *     description: Lista todas las solicitudes con filtros opcionales
 *     tags: [CSW]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (ID)
 *       - in: query
 *         name: requester
 *         schema:
 *           type: string
 *         description: Filtrar por solicitante (ID)
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filtrar por división (ID)
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
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
 *                     $ref: '#/components/schemas/CSW'
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
router.get(
  '/',
  authMiddleware,
  requirePermission('csw', 'read'),
  getCSWs
);

/**
 * @swagger
 * /api/v1/csw/my-pending:
 *   get:
 *     summary: Obtener solicitudes pendientes de mi aprobación
 *     description: Lista todas las solicitudes donde el usuario actual es el aprobador del nivel actual
 *     tags: [CSW]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes
 */
router.get(
  '/my-pending',
  authMiddleware,
  requirePermission('csw', 'approve'),
  getMyPendingApprovals
);

/**
 * @swagger
 * /api/v1/csw/my-requests:
 *   get:
 *     summary: Obtener mis solicitudes creadas
 *     description: Lista todas las solicitudes creadas por el usuario actual
 *     tags: [CSW]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes
 */
router.get(
  '/my-requests',
  authMiddleware,
  requirePermission('csw', 'read'),
  getMyRequests
);

/**
 * @swagger
 * /api/v1/csw/stats:
 *   get:
 *     summary: Obtener estadísticas de CSW
 *     tags: [CSW]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get(
  '/stats',
  authMiddleware,
  requirePermission('csw', 'read'),
  getCSWStats
);

/**
 * @swagger
 * /api/v1/csw/{id}:
 *   get:
 *     summary: Obtener una solicitud por ID
 *     tags: [CSW]
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
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermission('csw', 'read'),
  getCSWById
);

/**
 * @swagger
 * /api/v1/csw/{id}/history:
 *   get:
 *     summary: Obtener historial de una solicitud
 *     description: Retorna el historial completo de acciones realizadas sobre la solicitud
 *     tags: [CSW]
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
 *         description: Historial obtenido exitosamente
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
 *                     $ref: '#/components/schemas/CSWHistory'
 */
router.get(
  '/:id/history',
  authMiddleware,
  requirePermission('csw', 'read'),
  getCSWHistory
);

/**
 * @swagger
 * /api/v1/csw:
 *   post:
 *     summary: Crear una nueva solicitud CSW
 *     description: |
 *       Crea una nueva solicitud y genera automáticamente la cadena de aprobación basada en el flujo de la división del usuario.
 *       
 *       **Flujo:**
 *       1. Se captura la división del usuario automáticamente
 *       2. Se busca el flujo de aprobación activo de esa división
 *       3. Se genera la cadena de aprobación secuencial
 *       4. Se inicia en nivel 1 con estado "pending"
 *       
 *       **Límites de caracteres:**
 *       - Cada campo (situation, information, solution): Máximo 250 caracteres
 *     tags: [CSW]
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
 *               - category
 *               - situation
 *               - information
 *               - solution
 *             properties:
 *               category:
 *                 type: string
 *                 description: ID de la categoría
 *               situation:
 *                 type: string
 *                 maxLength: 1500
 *                 description: "¿Qué sucede?"
 *               information:
 *                 type: string
 *                 maxLength: 1500
 *                 description: "¿Qué datos tienes?"
 *               solution:
 *                 type: string
 *                 maxLength: 1500
 *                 description: "¿Cómo se resuelve?"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 */
router.post(
  '/',
  authMiddleware,
  requirePermission('csw', 'create'),
  createCSW
);

/**
 * @swagger
 * /api/v1/csw/{id}:
 *   put:
 *     summary: Editar una solicitud CSW
 *     description: |
 *       Permite editar una solicitud SOLO si está en estado "rejected".
 *       
 *       **Comportamiento importante:**
 *       - Al editar, TODAS las aprobaciones se resetean a "pending"
 *       - El estado general vuelve a "pending"
 *       - El nivel actual vuelve a 1
 *       - El historial completo se PRESERVA (no se borra)
 *       - El flujo de aprobación comienza desde cero
 *     tags: [CSW]
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
 *               situation:
 *                 type: string
 *                 maxLength: 1500
 *               information:
 *                 type: string
 *                 maxLength: 1500
 *               solution:
 *                 type: string
 *                 maxLength: 1500
 *     responses:
 *       200:
 *         description: Solicitud actualizada, aprobaciones reseteadas
 *       400:
 *         description: Solo se pueden editar solicitudes rechazadas
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermission('csw', 'update'),
  updateCSW
);

/**
 * @swagger
 * /api/v1/csw/{id}/approve:
 *   post:
 *     summary: Aprobar una solicitud en el nivel actual
 *     description: |
 *       Aprueba la solicitud en el nivel actual si el usuario es el aprobador asignado.
 *       
 *       **Validaciones:**
 *       - El usuario debe ser el aprobador del nivel actual
 *       - La solicitud debe estar en estado "pending"
 *       - Solo se puede aprobar el nivel actual (no se pueden saltar niveles)
 *       
 *       **Flujo:**
 *       - Si es el último nivel → Estado general cambia a "approved"
 *       - Si no es el último → Avanza al siguiente nivel (currentLevel++)
 *       - Se registra en el historial con fecha, hora y persona
 *     tags: [CSW]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 maxLength: 1500
 *                 description: Comentarios opcionales
 *     responses:
 *       200:
 *         description: Solicitud aprobada en el nivel actual
 *       400:
 *         description: No tiene permisos o no es el nivel actual
 */
router.post(
  '/:id/approve',
  authMiddleware,
  requirePermission('csw', 'approve'),
  approveCSW
);

/**
 * @swagger
 * /api/v1/csw/{id}/reject:
 *   post:
 *     summary: Rechazar una solicitud en el nivel actual
 *     description: |
 *       Rechaza la solicitud en el nivel actual si el usuario es el aprobador asignado.
 *       
 *       **Importante:**
 *       - Los comentarios son OBLIGATORIOS al rechazar
 *       - Al rechazar, el estado general cambia inmediatamente a "rejected"
 *       - La solicitud debe ser editada por el solicitante para volver a flujo
 *       - Se registra en el historial con fecha, hora, persona y motivo
 *     tags: [CSW]
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
 *             required:
 *               - comments
 *             properties:
 *               comments:
 *                 type: string
 *                 maxLength: 1500
 *                 description: Motivo del rechazo (OBLIGATORIO)
 *     responses:
 *       200:
 *         description: Solicitud rechazada
 *       400:
 *         description: Comentarios requeridos o no tiene permisos
 */
router.post(
  '/:id/reject',
  authMiddleware,
  requirePermission('csw', 'approve'),
  rejectCSW
);

/**
 * @swagger
 * /api/v1/csw/{id}/cancel:
 *   post:
 *     summary: Cancelar una solicitud
 *     description: |
 *       Permite al solicitante cancelar su propia solicitud.
 *       
 *       **Restricciones:**
 *       - Solo el solicitante puede cancelar
 *       - No se puede cancelar si ya está aprobada
 *     tags: [CSW]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 maxLength: 1500
 *                 description: Motivo de la cancelación (opcional)
 *     responses:
 *       200:
 *         description: Solicitud cancelada
 *       400:
 *         description: No es el solicitante o ya está aprobada
 */
router.post(
  '/:id/cancel',
  authMiddleware,
  requirePermission('csw', 'cancel'),
  cancelCSW
);

/**
 * @swagger
 * /api/v1/csw/{id}:
 *   delete:
 *     summary: Eliminar una solicitud (soft delete)
 *     tags: [CSW]
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
 *         description: Solicitud eliminada exitosamente
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermission('csw', 'delete'),
  deleteCSW
);

export default router;

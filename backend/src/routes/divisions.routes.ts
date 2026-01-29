import { Router } from 'express';
import {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionStats
} from '../controllers/divisions.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /divisions:
 *   get:
 *     tags: [Divisions]
 *     summary: Listar todas las divisiones
 *     description: Obtiene lista completa de divisiones con sus managers
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de divisiones
 */
router.get('/', requirePermission('divisions', 'read'), getDivisions);

/**
 * @swagger
 * /divisions/{id}/stats:
 *   get:
 *     tags: [Divisions]
 *     summary: Estadísticas de una división
 *     description: Obtiene estadísticas de empleados por rol en la división
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
 *         description: Estadísticas de la división
 */
router.get('/:id/stats', requirePermission('divisions', 'read'), getDivisionStats);

/**
 * @swagger
 * /divisions/{id}:
 *   get:
 *     tags: [Divisions]
 *     summary: Obtener división por ID
 *     description: Retorna detalles de la división y sus empleados
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
 *         description: División encontrada
 *       404:
 *         description: División no encontrada
 */
router.get('/:id', requirePermission('divisions', 'read'), getDivisionById);

/**
 * @swagger
 * /divisions:
 *   post:
 *     tags: [Divisions]
 *     summary: Crear nueva división
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: División creada
 */
router.post('/', requirePermission('divisions', 'create'), createDivision);

/**
 * @swagger
 * /divisions/{id}:
 *   put:
 *     tags: [Divisions]
 *     summary: Actualizar división
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
 *               description:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: División actualizada
 */
router.put('/:id', requirePermission('divisions', 'update'), updateDivision);

/**
 * @swagger
 * /divisions/{id}:
 *   delete:
 *     tags: [Divisions]
 *     summary: Eliminar división
 *     description: Soft delete - solo si no tiene empleados activos
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
 *         description: División eliminada
 */
router.delete('/:id', requirePermission('divisions', 'delete'), deleteDivision);

export default router;

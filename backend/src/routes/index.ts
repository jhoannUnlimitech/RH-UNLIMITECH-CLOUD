import { Router } from 'express';
import authRoutes from './auth.routes';
import employeesRoutes from './employees.routes';
import divisionsRoutes from './divisions.routes';
import rolesRoutes from './roles.routes';
import permissionsRoutes from './permissions.routes';
import approvalFlowRoutes from './approvalFlow.routes';
import cswCategoryRoutes from './cswCategory.routes';
import cswRoutes from './csw.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de empleados
router.use('/employees', employeesRoutes);

// Rutas de divisiones
router.use('/divisions', divisionsRoutes);

// Rutas de roles
router.use('/roles', rolesRoutes);

// Rutas de permisos
router.use('/permissions', permissionsRoutes);

// Rutas de flujos de aprobación
router.use('/approval-flows', approvalFlowRoutes);

// Rutas de categorías CSW
router.use('/csw-categories', cswCategoryRoutes);

// Rutas de CSW (Canal de Solicitudes de Trabajo)
router.use('/csw', cswRoutes);

// Rutas de capacitaciones (se agregarán después)
// router.use('/training', trainingRoutes);

export default router;

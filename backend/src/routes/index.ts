import { Router } from 'express';
import authRoutes from './auth.routes';
import employeesRoutes from './employees.routes';
import divisionsRoutes from './divisions.routes';
import hatsRoutes from './hats.routes';
import permissionsRoutes from './permissions.routes';
import approvalFlowRoutes from './approvalFlow.routes';
import cswCategoryRoutes from './cswCategory.routes';
import cswRoutes from './csw.routes';
import projectsRoutes from './projects.routes';
import weeklyReportRoutes from './weeklyReport.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de empleados
router.use('/employees', employeesRoutes);

// Rutas de divisiones
router.use('/divisions', divisionsRoutes);

// Rutas de hats
router.use('/roles', hatsRoutes);

// Rutas de permisos
router.use('/permissions', permissionsRoutes);

// Rutas de flujos de aprobación
router.use('/approval-flows', approvalFlowRoutes);

// Rutas de categorías CSW
router.use('/csw-categories', cswCategoryRoutes);

// Rutas de CSW (Canal de Solicitudes de Trabajo)
router.use('/csw', cswRoutes);

// Rutas de proyectos
router.use('/projects', projectsRoutes);

// Rutas de reportes semanales
router.use('/reports/weekly', weeklyReportRoutes);

// Rutas de capacitaciones (se agregarán después)
// router.use('/training', trainingRoutes);

export default router;

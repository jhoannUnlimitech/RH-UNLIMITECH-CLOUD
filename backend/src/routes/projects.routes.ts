import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  getMyProjects,
  createProject,
  updateProject,
  addMember,
  removeMember,
  deleteProject
} from '../controllers/projects.controller';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authMiddleware);

// Mis proyectos (cualquier usuario autenticado)
router.get('/my-projects', getMyProjects);

// CRUD con permisos
router.get('/', requirePermission('employees', 'read'), getProjects);
router.get('/:id', requirePermission('employees', 'read'), getProjectById);
router.post('/', requirePermission('divisions', 'create'), createProject);
router.put('/:id', requirePermission('divisions', 'update'), updateProject);
router.delete('/:id', requirePermission('divisions', 'delete'), deleteProject);

// Miembros
router.post('/:id/members', requirePermission('divisions', 'update'), addMember);
router.delete('/:id/members/:employeeId', requirePermission('divisions', 'update'), removeMember);

export default router;

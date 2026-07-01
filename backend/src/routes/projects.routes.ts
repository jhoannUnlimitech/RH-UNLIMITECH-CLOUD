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
import { validate } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';

const router = Router();

router.use(authMiddleware);

// Mis proyectos (cualquier usuario autenticado)
router.get('/my-projects', getMyProjects);

// CRUD con permisos
router.get('/', requirePermission('projects', 'read'), getProjects);
router.get('/:id', requirePermission('projects', 'read'), getProjectById);
router.post('/', requirePermission('projects', 'create'), validate(createProjectSchema), createProject);
router.put('/:id', requirePermission('projects', 'update'), validate(updateProjectSchema), updateProject);
router.delete('/:id', requirePermission('projects', 'delete'), deleteProject);

// Miembros
router.post('/:id/members', requirePermission('projects', 'update'), addMember);
router.delete('/:id/members/:employeeId', requirePermission('projects', 'update'), removeMember);

export default router;

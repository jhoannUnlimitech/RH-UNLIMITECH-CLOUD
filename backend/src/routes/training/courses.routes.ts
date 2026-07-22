import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { validate } from '../../middleware/validate';
import { createCourseSchema, updateCourseSchema, reorderCoursesSchema } from '../../validators/training/course.validator';
import { getCourses, getCourseById, createCourse, updateCourse, reorderCourses, deleteCourse } from '../../controllers/training/course.controller';

/**
 * Course Routes — Cursos del módulo Training.
 * Base: /api/v1/training/courses
 *
 * Permisos:
 *   - read: ver cursos (todos los empleados)
 *   - manage: crear, editar, reordenar, eliminar (admin training)
 */

const router = Router();

router.get('/', authMiddleware, requirePermission('training', 'read'), getCourses);
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getCourseById);
router.post('/', authMiddleware, requirePermission('training', 'manage'), validate(createCourseSchema), createCourse);
router.put('/reorder', authMiddleware, requirePermission('training', 'manage'), validate(reorderCoursesSchema), reorderCourses);
router.put('/:id', authMiddleware, requirePermission('training', 'manage'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', authMiddleware, requirePermission('training', 'manage'), deleteCourse);

export default router;

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { courseService } from '../../services/training/course.service';

/**
 * CourseController — Manejo HTTP para cursos de Training.
 */

/** GET /api/v1/training/courses */
export const getCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const level = req.query.level as string | undefined;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;

    const courses = level
      ? await courseService.getByLevel(level)
      : await courseService.getAll({ active });

    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/training/courses/:id */
export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await courseService.getById(id);
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/training/courses */
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.create(req.body);
    res.status(201).json({ success: true, data: course, message: 'Curso creado exitosamente' });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/training/courses/:id */
export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await courseService.update(id, req.body);
    res.json({ success: true, data: course, message: 'Curso actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/training/courses/reorder */
export const reorderCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await courseService.reorder(req.body.courses);
    res.json({ success: true, message: 'Cursos reordenados exitosamente' });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/v1/training/courses/:id */
export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await courseService.delete(id);
    res.json({ success: true, message: 'Curso eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

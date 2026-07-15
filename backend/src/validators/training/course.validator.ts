import { z } from 'zod';
import { objectId } from '../common';

/**
 * Validators Zod — Course (Cursos de Training)
 */

export const createCourseSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),
  description: z.string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),
  link: z.string()
    .url('El link debe ser una URL válida')
    .optional(),
  libraryDocument: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    objectId.optional()
  ),
  order: z.number()
    .int()
    .min(0)
    .optional(),
  level: objectId,
  estimatedHours: z.number()
    .min(0.25, 'Las horas estimadas deben ser al menos 0.25')
    .max(100)
    .optional(),
  active: z.boolean().optional().default(true),
}).strict();

export const updateCourseSchema = z.object({
  name: z.string()
    .min(3)
    .max(150)
    .trim()
    .optional(),
  description: z.string()
    .min(3)
    .max(500)
    .trim()
    .optional(),
  link: z.string()
    .url()
    .optional()
    .nullable(),
  libraryDocument: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    objectId.optional()
  ),
  order: z.number()
    .int()
    .min(0)
    .optional(),
  level: objectId.optional(),
  estimatedHours: z.number()
    .min(0.25)
    .max(100)
    .optional()
    .nullable(),
  active: z.boolean().optional(),
}).strict();

export const reorderCoursesSchema = z.object({
  courses: z.array(z.object({
    id: objectId,
    order: z.number().int().min(0),
  })).min(1, 'Debe incluir al menos un curso'),
}).strict();

import { z } from 'zod';
import { objectId } from '../common';

/**
 * Validators Zod — LibraryCategory (Categorías de la Biblioteca)
 */

export const createLibraryCategorySchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z.string()
    .max(250, 'La descripción no puede exceder 250 caracteres')
    .optional()
    .default(''),
  icon: z.string()
    .max(20)
    .optional(),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido (#RRGGBB)')
    .optional(),
  parent: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    objectId.optional()
  ),
  order: z.number()
    .int()
    .min(0)
    .optional()
    .default(0),
  active: z.boolean()
    .optional()
    .default(true),
}).strict();

export const updateLibraryCategorySchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .trim()
    .optional(),
  description: z.string()
    .max(250)
    .optional(),
  icon: z.string()
    .max(20)
    .optional(),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido')
    .optional()
    .nullable(),
  parent: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    objectId.optional()
  ),
  order: z.number()
    .int()
    .min(0)
    .optional(),
  active: z.boolean()
    .optional(),
}).strict();

export const reorderLibraryCategoriesSchema = z.object({
  categories: z.array(z.object({
    id: objectId,
    order: z.number().int().min(0),
  })).min(1, 'Debe incluir al menos una categoría'),
}).strict();

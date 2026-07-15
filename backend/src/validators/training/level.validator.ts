import { z } from 'zod';
import { objectId } from '../common';

/**
 * Validators Zod — Level (Niveles de Training)
 */

export const createLevelSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150).trim(),
  description: z.string().max(500).optional().default(''),
  order: z.number().int().min(0).optional(),
  badge: objectId,
  exam: z.preprocess((val) => (val === '' || val === null ? undefined : val), objectId.optional()),
  courses: z.array(objectId).optional().default([]),
  requiredCoursesCount: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
}).strict();

export const updateLevelSchema = z.object({
  name: z.string().min(3).max(150).trim().optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  badge: objectId.optional(),
  exam: z.preprocess((val) => (val === '' || val === null ? undefined : val), objectId.optional()),
  courses: z.array(objectId).optional(),
  requiredCoursesCount: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).strict();

export const reorderLevelsSchema = z.object({
  levels: z.array(z.object({
    id: objectId,
    order: z.number().int().min(0),
  })).min(1, 'Debe incluir al menos un nivel'),
}).strict();

import { z } from 'zod';
import { objectId } from './common';

/**
 * Transforma string vacío a undefined para que Zod lo trate como campo ausente.
 * El frontend envía directApproverId: "" cuando useDefaultFlow=true.
 */
const optionalObjectIdOrEmpty = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  objectId.optional()
);

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(100).trim(),
  description: z.string().max(250).optional().default(''),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
  useDefaultFlow: z.boolean().optional().default(true),
  directApproverId: optionalObjectIdOrEmpty,
}).strict();

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(250).optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  useDefaultFlow: z.boolean().optional(),
  directApproverId: optionalObjectIdOrEmpty,
}).strict();

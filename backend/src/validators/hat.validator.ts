import { z } from 'zod';
import { objectId } from './common';

export const createHatSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(100),
  permissions: z.array(objectId).optional().default([]),
}).strict();

export const updateHatSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  permissions: z.array(objectId).optional(),
}).strict();

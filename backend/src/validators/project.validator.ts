import { z } from 'zod';
import { objectId } from './common';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(200),
  code: z.string().min(1).max(20),
  description: z.string().max(1000).optional().default(''),
  divisionId: objectId,
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional().default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  members: z.array(objectId).optional().default([]),
  leadId: objectId.optional(),
  links: z.array(z.object({
    name: z.string().max(100),
    url: z.string().max(500),
  })).optional().default([]),
}).strict();

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  description: z.string().max(1000).optional(),
  divisionId: objectId.optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  members: z.array(objectId).optional(),
  leadId: objectId.optional(),
  links: z.array(z.object({
    name: z.string().max(100),
    url: z.string().max(500),
  })).optional(),
}).strict();

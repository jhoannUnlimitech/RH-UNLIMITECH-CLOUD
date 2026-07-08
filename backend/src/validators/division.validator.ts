import { z } from 'zod';
import { objectId } from './common';

export const createDivisionSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(150).trim(),
  code: z.string().min(1).max(20).transform(v => v.toUpperCase().trim()),
  description: z.string().max(500).optional().default(''),
  managerId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    objectId.optional()
  ),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  approvalFlow: z.array(z.object({
    order: z.number().int().min(1),
    employeeId: objectId,
  })).optional().default([]),
}).strict();

export const updateDivisionSchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  code: z.string().min(1).max(20).transform(v => v.toUpperCase().trim()).optional(),
  description: z.string().max(500).optional(),
  managerId: objectId.optional(),
  status: z.enum(['active', 'inactive']).optional(),
  approvalFlow: z.array(z.object({
    order: z.number().int().min(1),
    employeeId: objectId,
  })).optional(),
}).strict();

import { z } from 'zod';
import { objectId } from './common';

export const createFlowSchema = z.object({
  divisionId: objectId,
  name: z.string().min(2, 'Nombre requerido').max(100),
  description: z.string().max(300).optional().default(''),
  levels: z.array(z.object({
    order: z.number().int().min(1),
    name: z.string().min(1).max(100),
    approverType: z.enum(['user', 'role']),
    approverUserId: objectId.optional(),
    approverRoleId: objectId.optional(),
    required: z.boolean().optional().default(true),
    autoApprove: z.boolean().optional().default(false),
  })).min(1, 'Al menos un nivel requerido'),
  active: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
}).strict();

export const updateFlowSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(300).optional(),
  levels: z.array(z.object({
    order: z.number().int().min(1),
    name: z.string().min(1).max(100),
    approverType: z.enum(['user', 'role']),
    approverUserId: objectId.optional(),
    approverRoleId: objectId.optional(),
    required: z.boolean().optional().default(true),
    autoApprove: z.boolean().optional().default(false),
  })).min(1).optional(),
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
}).strict();

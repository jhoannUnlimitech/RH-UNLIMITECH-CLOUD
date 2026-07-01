import { z } from 'zod';

export const createPermissionSchema = z.object({
  resource: z.string().min(1, 'Recurso requerido').max(50),
  action: z.enum(['read', 'create', 'update', 'delete', 'approve', 'cancel']),
}).strict();

export const updatePermissionSchema = z.object({
  resource: z.string().min(1).max(50).optional(),
  action: z.enum(['read', 'create', 'update', 'delete', 'approve', 'cancel']).optional(),
}).strict();

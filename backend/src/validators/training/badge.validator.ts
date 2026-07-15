import { z } from 'zod';
import { objectId } from '../common';
import { BADGE_SHAPES } from '../../models/training/Badge';

/**
 * Validators Zod — Badge (Insignias de Training)
 */

const badgeShape = z.enum(BADGE_SHAPES as [string, ...string[]]);

export const createBadgeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100).trim(),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(300).trim(),
  icon: z.string().min(1, 'El ícono es requerido').max(50).trim(),
  shape: badgeShape,
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido'),
  levels: z.array(objectId).optional().default([]),
  active: z.boolean().optional().default(true),
}).strict();

export const updateBadgeSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  description: z.string().min(3).max(300).trim().optional(),
  icon: z.string().min(1).max(50).trim().optional(),
  shape: badgeShape.optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser hexadecimal válido').optional(),
  levels: z.array(objectId).optional(),
  active: z.boolean().optional(),
}).strict();

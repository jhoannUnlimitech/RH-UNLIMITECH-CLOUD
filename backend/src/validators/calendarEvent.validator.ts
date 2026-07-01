import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  description: z.string().max(1000).optional().default(''),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  startTime: z.string().max(10).optional().default(''),
  endTime: z.string().max(10).optional().default(''),
  type: z.enum(['meeting', 'holiday', 'birthday', 'training', 'other']).optional().default('other'),
  color: z.string().max(20).optional().default('primary'),
  allDay: z.boolean().optional().default(true),
  link: z.string().max(500).optional().default(''),
  notifyBefore: z.number().int().min(0).max(1440).optional().default(0),
}).strict();

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().max(10).optional(),
  endTime: z.string().max(10).optional(),
  type: z.enum(['meeting', 'holiday', 'birthday', 'training', 'other']).optional(),
  color: z.string().max(20).optional(),
  allDay: z.boolean().optional(),
  link: z.string().max(500).optional(),
  notifyBefore: z.number().int().min(0).max(1440).optional(),
}).strict();

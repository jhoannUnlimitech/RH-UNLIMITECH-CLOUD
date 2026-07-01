import { z } from 'zod';
import { objectId, optionalObjectId } from './common';

export const createEmployeeSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: objectId,
  division: objectId,
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  nationalId: z.string().min(3).max(30),
  phone: z.string().min(7).max(20),
  nationality: z.string().min(2).max(50),
  address: z.string().max(300).optional().default(''),
  emergencyContact: z.string().max(200).optional().default(''),
  emergencyPhone: z.string().max(20).optional().default(''),
  photo: z.string().max(2_000_000).optional(), // Base64 ~1.5MB max
  managerId: optionalObjectId,
  techLeadId: optionalObjectId,
  approve_csw: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  forcePasswordChange: z.boolean().optional().default(false),
}).strict();

export const updateEmployeeSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  email: z.string().email('Email inválido').optional(),
  role: objectId.optional(),
  division: objectId.optional(),
  birthDate: z.string().optional(),
  nationalId: z.string().min(3).max(30).optional(),
  phone: z.string().min(7).max(20).optional(),
  nationality: z.string().min(2).max(50).optional(),
  address: z.string().max(300).optional(),
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  photo: z.string().max(2_000_000).optional(),
  managerId: optionalObjectId,
  techLeadId: optionalObjectId,
  approve_csw: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  forcePasswordChange: z.boolean().optional(),
}).strict();

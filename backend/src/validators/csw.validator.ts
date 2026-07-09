import { z } from 'zod';

export const createCSWSchema = z.object({
  category: z.string().min(1, 'La categoría es requerida').max(30),
  situation: z.string().max(10000, 'Situación excede el límite').optional().default(''),
  information: z.string().max(10000, 'Información excede el límite').optional().default(''),
  solution: z.string().max(10000, 'Solución excede el límite').optional().default(''),
});

export const updateCSWSchema = z.object({
  situation: z.string().max(10000).optional(),
  information: z.string().max(10000).optional(),
  solution: z.string().max(10000).optional(),
  category: z.string().max(30).optional(),
});

export const approveRejectSchema = z.object({
  comments: z.string().max(1500, 'Comentarios exceden el límite').optional(),
});

export const rejectSchema = z.object({
  comments: z.string().min(1, 'Los comentarios son obligatorios al rechazar').max(1500),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayúscula')
    .regex(/[0-9]/, 'Al menos un número'),
});

import { z } from 'zod';
import { objectId } from '../common';

/**
 * Validators Zod — LibraryDocument (Documentos de la Biblioteca)
 */

const documentType = z.enum(['article', 'link', 'file', 'mixed']);
const visibility = z.enum(['all', 'specific_roles', 'specific_divisions']);

export const createLibraryDocumentSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .default(''),
  category: objectId,
  type: documentType,

  // Contenido (según type)
  content: z.string().optional().default(''),
  externalLink: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('El link debe ser una URL válida').optional()
  ),
  fileUrl: z.string().optional(),
  fileName: z.string().max(255).optional(),
  fileMimeType: z.string().optional(),

  // Metadata
  tags: z.array(
    z.string().max(50).trim().toLowerCase()
  ).optional().default([]),

  // Visibilidad
  visibility: visibility.optional().default('all'),
  visibleToRoles: z.array(objectId).optional(),
  visibleToDivisions: z.array(objectId).optional(),

  // Estado
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
}).strict();

export const updateLibraryDocumentSchema = z.object({
  title: z.string()
    .min(3)
    .max(200)
    .trim()
    .optional(),
  description: z.string()
    .max(500)
    .optional(),
  category: objectId.optional(),
  type: documentType.optional(),

  // Contenido
  content: z.string().optional(),
  externalLink: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url().optional().nullable()
  ),
  fileUrl: z.string().optional().nullable(),
  fileName: z.string().max(255).optional().nullable(),
  fileMimeType: z.string().optional().nullable(),

  // Metadata
  tags: z.array(
    z.string().max(50).trim().toLowerCase()
  ).optional(),
  changeNote: z.string()
    .max(200, 'La nota del cambio no puede exceder 200 caracteres')
    .optional(),

  // Visibilidad
  visibility: visibility.optional(),
  visibleToRoles: z.array(objectId).optional(),
  visibleToDivisions: z.array(objectId).optional(),

  // Estado
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
}).strict();

export const publishDocumentSchema = z.object({
  published: z.boolean(),
}).strict();

export const featureDocumentSchema = z.object({
  featured: z.boolean(),
}).strict();

import { z } from 'zod';
import { objectId } from '../common';

/**
 * Validators Zod — Exam (Exámenes de Training)
 *
 * Tipos de pregunta: multiple_choice (auto-evaluable) y open_text (evaluación manual).
 * Sin tiempo límite (D6). maxAttempts default 1 (D5).
 */

const examOption = z.object({
  text: z.string().min(1, 'El texto de la opción es requerido').max(500).trim(),
  isCorrect: z.boolean(),
});

const examQuestion = z.object({
  question: z.string().min(3, 'La pregunta debe tener al menos 3 caracteres').max(2000).trim(),
  type: z.enum(['multiple_choice', 'open_text']),
  options: z.array(examOption).optional(),
  expectedAnswer: z.string().max(2000).trim().optional(),
  points: z.number().int().min(1).max(100).optional().default(10),
  order: z.number().int().min(0),
}).refine(
  (q) => {
    if (q.type === 'multiple_choice') {
      if (!q.options || q.options.length < 2) return false;
      const correctCount = q.options.filter(o => o.isCorrect).length;
      return correctCount === 1;
    }
    return true;
  },
  { message: 'Las preguntas de selección múltiple requieren al menos 2 opciones con exactamente 1 correcta' }
);

export const createExamSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .default(''),
  level: objectId.optional(),
  course: objectId.optional(),
  libraryDocument: objectId.optional(),
  questions: z.array(examQuestion)
    .min(1, 'El examen debe tener al menos 1 pregunta'),
  passingScore: z.number()
    .int()
    .min(1, 'El puntaje mínimo es 1%')
    .max(100, 'El puntaje máximo es 100%')
    .optional()
    .default(80),
  maxAttempts: z.number()
    .int()
    .min(1, 'Mínimo 1 intento')
    .max(10, 'Máximo 10 intentos')
    .optional()
    .default(1),
  active: z.boolean().optional().default(true),
}).strict();

export const updateExamSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(500).trim().optional(),
  level: objectId.optional().nullable(),
  course: objectId.optional().nullable(),
  libraryDocument: objectId.optional().nullable(),
  questions: z.array(examQuestion).min(1).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  active: z.boolean().optional(),
}).strict();

export const reorderQuestionsSchema = z.object({
  questions: z.array(z.object({
    order: z.number().int().min(0),
  })).min(1, 'Debe incluir al menos una pregunta'),
}).strict();

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate — Middleware factory para validar request body con Zod.
 *
 * Parsea el body contra el schema proporcionado. Si la validación falla,
 * responde 400 con los mensajes de error estructurados. Compatible con
 * Zod v4 (.issues) y maneja edge cases donde la lista de errores podría
 * no estar disponible.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 usa .issues; .errors fue renombrado. Soportamos ambos por seguridad
        const zodIssues = (error as any).issues ?? (error as any).errors;
        const messages = Array.isArray(zodIssues)
          ? zodIssues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`)
          : [error.message || 'Error de validación desconocido'];

        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: messages,
        });
        return;
      }
      next(error);
    }
  };
};

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pass-through para Swagger UI
 * Este middleware simplemente permite que las cookies pasen correctamente
 * Los usuarios deben autenticarse primero usando POST /api/v1/auth/login
 */
export const swaggerAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Agregar headers para permitir cookies en Swagger
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};

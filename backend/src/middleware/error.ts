import { Request, Response, NextFunction } from 'express';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: (err as any).errors
    });
    return;
  }

  // Error de duplicado de Mongoose
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`
    });
    return;
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'ID inválido proporcionado'
    });
    return;
  }

  // Log del error para debugging
  console.error('❌ ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

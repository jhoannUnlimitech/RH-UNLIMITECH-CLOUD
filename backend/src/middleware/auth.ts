import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
    roleName: string;
    divisionId: string;
  };
}

/**
 * Middleware de autenticación
 * Verifica el JWT almacenado en cookie httpOnly
 * Si el token es válido, agrega req.user con la información del empleado
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Debug: Ver todas las cookies recibidas
    if (config.env === 'development') {
      console.log('🍪 Cookies recibidas:', Object.keys(req.cookies));
      console.log('🔍 Buscando cookie:', config.jwt.cookieName);
    }
    
    // Intentar obtener token de la cookie PRIMERO
    let token = req.cookies[config.jwt.cookieName];
    
    // Si no hay cookie, intentar obtener de Authorization header (para Swagger/Postman)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remover "Bearer "
        if (config.env === 'development') {
          console.log('🔑 Usando token de Authorization header');
        }
      }
    }
    
    if (!token) {
      console.log('❌ No se encontró token (ni en cookie ni en header)');
      console.log('📋 Cookies disponibles:', req.cookies);
      console.log('📋 Authorization header:', req.headers.authorization);
      res.status(401).json({ 
        status: 'error',
        message: 'No autenticado. Por favor inicie sesión.',
        debug: config.env === 'development' ? {
          cookieName: config.jwt.cookieName,
          cookiesReceived: Object.keys(req.cookies),
          authHeader: req.headers.authorization ? 'presente' : 'ausente',
          hint: 'Ejecuta POST /api/v1/auth/login primero, o usa Authorization: Bearer <token>'
        } : undefined
      });
      return;
    }

    // Verificar token
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as {
      id: string;
      email: string;
      roleId: string;
      divisionId: string;
    };
    
    // Buscar empleado para validar que siga activo
    // Solo necesitamos verificar existencia y que no esté eliminado
    const employee = await Employee.findById(decoded.id)
      .populate('role', 'name permissions')
      .select('-password');
    
    if (!employee || employee.deleted) {
      res.status(401).json({ 
        status: 'error',
        message: 'Token inválido o usuario no existe.' 
      });
      return;
    }

    // Agregar usuario a la request con información del token
    // Usamos el token como source of truth para evitar queries adicionales
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: (employee.role as any).name,
      divisionId: decoded.divisionId
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        status: 'error',
        message: 'Token expirado. Por favor inicie sesión nuevamente.' 
      });
      return;
    }
    
    res.status(401).json({ 
      status: 'error',
      message: 'Token inválido.' 
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token válido, agrega req.user, pero no bloquea si no hay token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies[config.jwt.cookieName];
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as any;
      const employee = await Employee.findById(decoded.id)
        .populate('role', 'name')
        .select('-password');
      
      if (employee && !employee.deleted) {
        req.user = {
          id: employee.id,
          email: employee.email,
          roleId: (employee.role as any)._id.toString(),
          roleName: (employee.role as any).name
        };
      }
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin user
    next();
  }
};

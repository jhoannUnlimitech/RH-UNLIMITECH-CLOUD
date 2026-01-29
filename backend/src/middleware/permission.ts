import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { AppError } from './error';

/**
 * Middleware para verificar permisos específicos
 * Uso: requirePermission('employees', 'create')
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const role = await Role.findById(req.user.roleId)
        .populate('permissions');

      if (!role) {
        throw new AppError('Rol no encontrado', 403);
      }

      const hasPermission = (role.permissions as any[]).some(
        (perm: any) => perm.resource === resource && perm.action === action
      );

      if (!hasPermission) {
        throw new AppError('No tienes permisos para realizar esta acción', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar roles específicos
 * Uso: requireRole('ARCHITECT SOLUTIONS', 'HUMAN TALENT')
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'No autenticado'
      });
      return;
    }

    const hasRole = allowedRoles.includes(req.user.roleName);

    if (!hasRole) {
      res.status(403).json({
        status: 'error',
        message: 'No tienes permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};

import { Response, NextFunction } from 'express';
import { Permission } from '../models/Permission';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Obtener todos los permisos
 * @route   GET /api/v1/permissions
 * @access  Private (roles:read)
 */
export const getPermissions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = await Permission.find().sort('resource action');

    // Agrupar permisos por recurso para facilitar la UI
    const grouped = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push({
        _id: perm._id,
        action: perm.action,
        resource: perm.resource,
        createdAt: perm.createdAt,
        updatedAt: perm.updatedAt
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
      grouped
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener permiso por ID
 * @route   GET /api/v1/permissions/:id
 * @access  Private (roles:read)
 */
export const getPermissionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      throw new AppError('Permiso no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo permiso
 * @route   POST /api/v1/permissions
 * @access  Private (roles:create)
 */
export const createPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resource, action } = req.body;

    // Validar que no exista ya el permiso
    const existingPermission = await Permission.findOne({ resource, action });
    if (existingPermission) {
      throw new AppError('Este permiso ya existe', 400);
    }

    const permission = await Permission.create({
      resource,
      action
    });

    res.status(201).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un permiso
 * @route   PUT /api/v1/permissions/:id
 * @access  Private (roles:update)
 */
export const updatePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resource, action } = req.body;

    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      throw new AppError('Permiso no encontrado', 404);
    }

    // Validar que no exista otro permiso con la misma combinación
    if (resource && action) {
      const existingPermission = await Permission.findOne({
        resource,
        action,
        _id: { $ne: permission._id }
      });
      
      if (existingPermission) {
        throw new AppError('Ya existe un permiso con esta combinación', 400);
      }
    }

    permission.resource = resource || permission.resource;
    permission.action = action || permission.action;

    await permission.save();

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un permiso
 * @route   DELETE /api/v1/permissions/:id
 * @access  Private (roles:delete)
 */
export const deletePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      throw new AppError('Permiso no encontrado', 404);
    }

    // Verificar si el permiso está siendo usado por algún rol
    const { Role } = require('../models/Role');
    const rolesUsingPermission = await Role.countDocuments({
      permissions: req.params.id
    });

    if (rolesUsingPermission > 0) {
      throw new AppError(
        `No se puede eliminar este permiso porque está siendo usado por ${rolesUsingPermission} rol(es)`,
        400
      );
    }

    await permission.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Permiso eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener recursos únicos
 * @route   GET /api/v1/permissions/resources
 * @access  Private (roles:read)
 */
export const getResources = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resources = await Permission.distinct('resource');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener acciones únicas
 * @route   GET /api/v1/permissions/actions
 * @access  Private (roles:read)
 */
export const getActions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actions = await Permission.distinct('action');

    res.status(200).json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    next(error);
  }
};

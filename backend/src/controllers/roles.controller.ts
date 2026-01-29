import { Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { Employee } from '../models/Employee';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Obtener todos los roles
 * @route   GET /api/v1/roles
 * @access  Private (roles:read)
 */
export const getRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await Role.find()
      .populate('permissions', 'resource action')
      .sort('name');

    // Calcular empleados por rol
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const employeesCount = await Employee.countDocuments({ 
          role: role._id, 
          deleted: false 
        });
        return {
          ...role.toJSON(),
          employeesCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: rolesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener rol por ID
 * @route   GET /api/v1/roles/:id
 * @access  Private (roles:read)
 */
export const getRoleById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions', 'resource action');

    if (!role) {
      throw new AppError('Rol no encontrado', 404);
    }

    // Obtener empleados con este rol
    const employeesCount = await Employee.countDocuments({ role: role._id, deleted: false });

    res.status(200).json({
      success: true,
      data: {
        role,
        employeesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear nuevo rol
 * @route   POST /api/v1/roles
 * @access  Private (roles:create)
 */
export const createRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, permissions } = req.body;

    // Verificar que el nombre no esté en uso
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new AppError('Ya existe un rol con ese nombre', 400);
    }

    // Verificar que los permisos existan
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        throw new AppError('Uno o más permisos no son válidos', 400);
      }
    }

    // Crear rol
    const role = await Role.create({ name, permissions });

    // Obtener rol con permisos poblados
    const roleData = await Role.findById(role._id)
      .populate('permissions', 'resource action');

    res.status(201).json({
      success: true,
      data: roleData,
      message: 'Rol creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar rol
 * @route   PUT /api/v1/roles/:id
 * @access  Private (roles:update)
 */
export const updateRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    // Verificar que el rol exista
    const role = await Role.findById(id);
    if (!role) {
      throw new AppError('Rol no encontrado', 404);
    }

    // Si se actualiza el nombre, verificar que no esté en uso
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        throw new AppError('Ya existe un rol con ese nombre', 400);
      }
    }

    // Si se actualizan permisos, verificar que existan
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        throw new AppError('Uno o más permisos no son válidos', 400);
      }
    }

    // Actualizar rol
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true, runValidators: true }
    ).populate('permissions', 'resource action');

    res.status(200).json({
      success: true,
      data: updatedRole,
      message: 'Rol actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar rol
 * @route   DELETE /api/v1/roles/:id
 * @access  Private (roles:delete)
 */
export const deleteRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que el rol exista
    const role = await Role.findById(id);
    if (!role) {
      throw new AppError('Rol no encontrado', 404);
    }

    // Verificar que no tenga empleados asignados
    const employeesCount = await Employee.countDocuments({ role: id, deleted: false });
    if (employeesCount > 0) {
      throw new AppError(
        `No se puede eliminar el rol. Tiene ${employeesCount} empleado(s) asignado(s)`,
        400
      );
    }

    // Eliminar rol
    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener todos los permisos disponibles
 * @route   GET /api/v1/roles/permissions/all
 * @access  Private (roles:read)
 */
export const getAllPermissions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = await Permission.find().sort('resource action');

    // Agrupar permisos por recurso
    const grouped = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push({
        id: perm._id,
        action: perm.action
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        permissions,
        grouped
      }
    });
  } catch (error) {
    next(error);
  }
};

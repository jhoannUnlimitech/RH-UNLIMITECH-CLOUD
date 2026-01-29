import { Response, NextFunction } from 'express';
import { Employee } from '../models/Employee';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Obtener todos los empleados con filtros y paginación
 * @route   GET /api/v1/employees
 * @access  Private (employees:read)
 */
export const getEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      division,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Construir query
    const query: any = {};

    // Búsqueda por nombre, email o nationalId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtros
    if (role) query.role = role;
    if (division) query.division = division;

    // Paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Ordenamiento
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort: any = { [sortBy as string]: sortOrder };

    // Ejecutar query
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .select('-password')
        .populate('role', 'name permissions')
        .populate('division', 'name description')
        .populate('managerId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener empleado por ID
 * @route   GET /api/v1/employees/:id
 * @access  Private (employees:read)
 */
export const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('-password')
      .populate('role', 'name permissions')
      .populate('division', 'name description managerId')
      .populate('managerId', 'name email');

    if (!employee) {
      throw new AppError('Empleado no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear nuevo empleado
 * @route   POST /api/v1/employees
 * @access  Private (employees:create)
 */
export const createEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      division,
      birthDate,
      nationalId,
      phone,
      nationality,
      address,
      emergencyContact,
      emergencyPhone,
      photo,
      managerId
    } = req.body;

    // Verificar que el email no esté en uso
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Verificar que el nationalId no esté en uso
    const existingNationalId = await Employee.findOne({ nationalId });
    if (existingNationalId) {
      throw new AppError('La cédula ya está registrada', 400);
    }

    // Crear empleado
    const employee = await Employee.create({
      name,
      email,
      password,
      role,
      division,
      birthDate,
      nationalId,
      phone,
      nationality,
      address,
      emergencyContact,
      emergencyPhone,
      photo,
      managerId
    });

    // Obtener empleado con relaciones pobladas
    const employeeData = await Employee.findById(employee._id)
      .select('-password')
      .populate('role', 'name permissions')
      .populate('division', 'name description')
      .populate('managerId', 'name email');

    res.status(201).json({
      success: true,
      data: employeeData,
      message: 'Empleado creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar empleado
 * @route   PUT /api/v1/employees/:id
 * @access  Private (employees:update)
 */
export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // No permitir actualizar password por esta ruta
    if (updates.password) {
      delete updates.password;
    }

    // Verificar que el empleado exista
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new AppError('Empleado no encontrado', 404);
    }

    // Si se actualiza email, verificar que no esté en uso
    if (updates.email && updates.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: updates.email });
      if (existingEmail) {
        throw new AppError('El email ya está registrado', 400);
      }
    }

    // Si se actualiza nationalId, verificar que no esté en uso
    if (updates.nationalId && updates.nationalId !== employee.nationalId) {
      const existingNationalId = await Employee.findOne({ nationalId: updates.nationalId });
      if (existingNationalId) {
        throw new AppError('La cédula ya está registrada', 400);
      }
    }

    // Actualizar empleado
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('role', 'name permissions')
      .populate('division', 'name description')
      .populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedEmployee,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar foto de empleado
 * @route   PUT /api/v1/employees/:id/photo
 * @access  Private (employees:update)
 */
export const updateEmployeePhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { photo } = req.body;

    if (!photo) {
      throw new AppError('La foto es requerida', 400);
    }

    // Verificar que el empleado exista
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new AppError('Empleado no encontrado', 404);
    }

    // Actualizar foto
    employee.photo = photo;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Foto actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar empleado (soft delete)
 * @route   DELETE /api/v1/employees/:id
 * @access  Private (employees:delete)
 */
export const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que el empleado exista
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new AppError('Empleado no encontrado', 404);
    }

    // No permitir eliminar el propio usuario
    if (employee._id.toString() === req.user?.id) {
      throw new AppError('No puedes eliminar tu propia cuenta', 400);
    }

    // Soft delete
    await employee.softDelete();

    res.status(200).json({
      success: true,
      message: 'Empleado eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restaurar empleado eliminado
 * @route   PUT /api/v1/employees/:id/restore
 * @access  Private (employees:create)
 */
export const restoreEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar empleado eliminado
    const employee = await Employee.findOne({ _id: id, deleted: true });
    if (!employee) {
      throw new AppError('Empleado eliminado no encontrado', 404);
    }

    // Restaurar
    await employee.restore();

    // Obtener empleado restaurado con relaciones
    const restoredEmployee = await Employee.findById(id)
      .select('-password')
      .populate('role', 'name permissions')
      .populate('division', 'name description')
      .populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      data: restoredEmployee,
      message: 'Empleado restaurado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de empleados
 * @route   GET /api/v1/employees/stats
 * @access  Private (employees:read)
 */
export const getEmployeeStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      total,
      byDivision,
      byRole
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: '$division', count: { $sum: 1 } } },
        { $lookup: { from: 'divisions', localField: '_id', foreignField: '_id', as: 'division' } },
        { $unwind: '$division' },
        { $project: { _id: 0, name: '$division.name', count: 1 } }
      ]),
      Employee.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } },
        { $unwind: '$role' },
        { $project: { _id: 0, name: '$role.name', count: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byDivision,
        byRole
      }
    });
  } catch (error) {
    next(error);
  }
};

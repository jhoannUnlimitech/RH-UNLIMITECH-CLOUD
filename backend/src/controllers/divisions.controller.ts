import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Division } from '../models/Division';
import { Employee } from '../models/Employee';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Obtener todas las divisiones
 * @route   GET /api/v1/divisions
 * @access  Private (divisions:read)
 */
export const getDivisions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const divisions = await Division.find()
      .populate('managerId', 'name email photo')
      .sort('name');

    // Transformar manualmente para asegurar que manager esté presente
    const divisionsWithManager = divisions.map(div => {
      const divObj = div.toObject();
      
      // Si managerId está poblado, crear el campo manager
      if (divObj.managerId && typeof divObj.managerId === 'object' && (divObj.managerId as any)._id) {
        divObj.manager = {
          _id: (divObj.managerId as any)._id,
          name: (divObj.managerId as any).name,
          email: (divObj.managerId as any).email,
          photo: (divObj.managerId as any).photo
        };
        // Convertir managerId a string
        divObj.managerId = (divObj.managerId as any)._id.toString();
      }
      
      return divObj;
    });

    res.status(200).json({
      success: true,
      data: divisionsWithManager
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener división por ID
 * @route   GET /api/v1/divisions/:id
 * @access  Private (divisions:read)
 */
export const getDivisionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const division = await Division.findById(req.params.id)
      .populate('managerId', 'name email phone photo');

    if (!division) {
      throw new AppError('División no encontrada', 404);
    }

    // Transformar manualmente para asegurar que manager esté presente
    const divObj = division.toObject();
    if (divObj.managerId && typeof divObj.managerId === 'object' && (divObj.managerId as any)._id) {
      divObj.manager = {
        _id: (divObj.managerId as any)._id,
        name: (divObj.managerId as any).name,
        email: (divObj.managerId as any).email,
        phone: (divObj.managerId as any).phone,
        photo: (divObj.managerId as any).photo
      };
      divObj.managerId = (divObj.managerId as any)._id.toString();
    }

    // Obtener empleados de la división
    const employees = await Employee.find({ division: division._id })
      .select('name email role photo')
      .populate('role', 'name');

    res.status(200).json({
      success: true,
      data: {
        division: divObj,
        employeeCount: employees.length,
        employees
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear nueva división
 * @route   POST /api/v1/divisions
 * @access  Private (divisions:create)
 */
export const createDivision = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description, managerId, status, approvalFlow } = req.body;

    console.log('📥 Request body:', req.body); // Debug

    // Validar campos requeridos
    if (!name || !name.trim()) {
      throw new AppError('El nombre de la división es requerido', 400);
    }

    if (!code || !code.trim()) {
      throw new AppError('El código de la división es requerido', 400);
    }

    if (!managerId || !managerId.trim()) {
      throw new AppError('El representante de la división es requerido', 400);
    }

    // Validar que managerId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw new AppError('El ID del representante no es válido', 400);
    }

    // Validar approvalFlow si existe
    if (approvalFlow && Array.isArray(approvalFlow)) {
      for (const level of approvalFlow) {
        if (!level.employeeId || !mongoose.Types.ObjectId.isValid(level.employeeId)) {
          throw new AppError(`El ID del empleado en el nivel ${level.order} del flujo de aprobación no es válido`, 400);
        }
      }
    }

    // Verificar que el nombre no esté en uso
    const existingDivision = await Division.findOne({ name: name.trim() });
    if (existingDivision) {
      throw new AppError('Ya existe una división con ese nombre', 400);
    }

    // Verificar que el código no esté en uso
    const existingCode = await Division.findOne({ code: code.toUpperCase().trim() });
    if (existingCode) {
      throw new AppError('Ya existe una división con ese código', 400);
    }

    // Verificar que el manager exista
    const manager = await Employee.findById(managerId);
    if (!manager) {
      throw new AppError('El representante especificado no existe', 404);
    }

    // Crear división
    const division = await Division.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim() || '',
      managerId,
      status: status || 'active',
      approvalFlow: approvalFlow || []
    });

    console.log('✅ División creada:', division._id); // Debug

    // Obtener división con manager poblado
    const divisionData = await Division.findById(division._id)
      .populate('managerId', 'name email photo');

    res.status(201).json({
      success: true,
      data: divisionData,
      message: 'División creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar división
 * @route   PUT /api/v1/divisions/:id
 * @access  Private (divisions:update)
 */
export const updateDivision = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description, managerId, status, approvalFlow } = req.body;

    console.log('📝 Actualizar división - ID:', id);
    console.log('📥 Request body:', req.body);

    // Verificar que la división exista
    const division = await Division.findById(id);
    if (!division) {
      throw new AppError('División no encontrada', 404);
    }

    // Si se actualiza el nombre, verificar que no esté en uso
    if (name && name !== division.name) {
      const existingDivision = await Division.findOne({ name });
      if (existingDivision) {
        throw new AppError('Ya existe una división con ese nombre', 400);
      }
    }

    // Si se actualiza el código, verificar que no esté en uso
    if (code && code.toUpperCase() !== division.code) {
      const existingCode = await Division.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        throw new AppError('Ya existe una división con ese código', 400);
      }
    }

    // Si se actualiza el manager, verificar que exista
    if (managerId && managerId !== division.managerId?.toString()) {
      // Validar que sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        throw new AppError('El ID del representante no es válido', 400);
      }
      
      const manager = await Employee.findById(managerId);
      if (!manager) {
        throw new AppError('El manager especificado no existe', 404);
      }
    }

    // Validar approvalFlow si existe
    if (approvalFlow && Array.isArray(approvalFlow)) {
      for (const level of approvalFlow) {
        if (!level.employeeId || !mongoose.Types.ObjectId.isValid(level.employeeId)) {
          throw new AppError(`El ID del empleado en el nivel ${level.order} del flujo de aprobación no es válido`, 400);
        }
      }
    }

    // Actualizar división
    const updatedDivision = await Division.findByIdAndUpdate(
      id,
      { 
        name, 
        code: code ? code.toUpperCase() : division.code,
        description, 
        managerId,
        status,
        approvalFlow: approvalFlow !== undefined ? approvalFlow : division.approvalFlow
      },
      { new: true, runValidators: true }
    ).populate('managerId', 'name email photo');

    res.status(200).json({
      success: true,
      data: updatedDivision,
      message: 'División actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar división (soft delete)
 * @route   DELETE /api/v1/divisions/:id
 * @access  Private (divisions:delete)
 */
export const deleteDivision = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que la división exista
    const division = await Division.findById(id);
    if (!division) {
      throw new AppError('División no encontrada', 404);
    }

    // Verificar que no tenga empleados activos
    const employeesCount = await Employee.countDocuments({ division: id, deleted: false });
    if (employeesCount > 0) {
      throw new AppError(
        `No se puede eliminar la división. Tiene ${employeesCount} empleado(s) asignado(s)`,
        400
      );
    }

    // Soft delete
    await division.softDelete();

    res.status(200).json({
      success: true,
      message: 'División eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener estadísticas de una división
 * @route   GET /api/v1/divisions/:id/stats
 * @access  Private (divisions:read)
 */
export const getDivisionStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que la división exista
    const division = await Division.findById(id);
    if (!division) {
      throw new AppError('División no encontrada', 404);
    }

    // Estadísticas
    const [
      totalEmployees,
      employeesByRole
    ] = await Promise.all([
      Employee.countDocuments({ division: id, deleted: false }),
      Employee.aggregate([
        { $match: { division: division._id, deleted: { $ne: true } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } },
        { $unwind: '$role' },
        { $project: { _id: 0, name: '$role.name', count: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        division: {
          id: division._id,
          name: division.name
        },
        totalEmployees,
        employeesByRole
      }
    });
  } catch (error) {
    next(error);
  }
};

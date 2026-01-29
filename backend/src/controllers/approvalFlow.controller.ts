import { Request, Response, NextFunction } from 'express';
import ApprovalFlow from '../models/ApprovalFlow';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

/**
 * Obtener todos los flujos de aprobación
 */
export const getApprovalFlows = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { divisionId, active } = req.query;
    
    const filter: any = { deleted: false };
    if (divisionId) filter.divisionId = divisionId;
    if (active !== undefined) filter.active = active === 'true';
    
    const flows = await ApprovalFlow.find(filter)
      .populate('divisionId', 'name')
      .populate('levels.approverRoleId', 'name')
      .populate('levels.approverUserId', 'name email')
      .sort({ divisionId: 1, active: -1 });
    
    res.json({
      success: true,
      data: flows,
      message: `Se encontraron ${flows.length} flujos de aprobación`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un flujo por ID
 */
export const getApprovalFlowById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const flow = await ApprovalFlow.findOne({ _id: id, deleted: false })
      .populate('divisionId', 'name')
      .populate('levels.approverRoleId', 'name')
      .populate('levels.approverUserId', 'name email');
    
    if (!flow) {
      res.status(404).json({
        success: false,
        message: 'Flujo de aprobación no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      data: flow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener flujo activo por división
 */
export const getActiveFlowByDivision = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { divisionId } = req.params;
    
    const flow = await ApprovalFlow.findOne({
      divisionId,
      active: true,
      deleted: false
    }).populate('divisionId', 'name')
      .populate('levels.approverRoleId', 'name')
      .populate('levels.approverUserId', 'name email');
    
    if (!flow) {
      res.status(404).json({
        success: false,
        message: 'No se encontró un flujo de aprobación activo para esta división'
      });
      return;
    }
    
    res.json({
      success: true,
      data: flow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo flujo de aprobación
 */
export const createApprovalFlow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { divisionId, name, description, levels, active, isDefault } = req.body;
    
    // Validar que la división exista
    const Division = mongoose.model('Division');
    const division = await Division.findById(divisionId);
    if (!division) {
      res.status(404).json({
        success: false,
        message: 'División no encontrada'
      });
      return;
    }
    
    // Validar niveles
    if (!levels || levels.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Debe definir al menos un nivel de aprobación'
      });
      return;
    }
    
    // Crear el flujo
    const flow = new ApprovalFlow({
      divisionId,
      name,
      description,
      levels,
      active: active !== undefined ? active : true,
      isDefault: isDefault || false
    });
    
    await flow.save();
    
    await flow.populate('divisionId', 'name');
    await flow.populate('levels.approverRoleId', 'name');
    await flow.populate('levels.approverUserId', 'name email');
    
    res.status(201).json({
      success: true,
      data: flow,
      message: 'Flujo de aprobación creado exitosamente'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }
    next(error);
  }
};

/**
 * Actualizar un flujo de aprobación
 */
export const updateApprovalFlow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, levels, active, isDefault } = req.body;
    
    const flow = await ApprovalFlow.findOne({ _id: id, deleted: false });
    
    if (!flow) {
      res.status(404).json({
        success: false,
        message: 'Flujo de aprobación no encontrado'
      });
      return;
    }
    
    // Actualizar campos
    if (name) flow.name = name;
    if (description !== undefined) flow.description = description;
    if (levels) flow.levels = levels;
    if (active !== undefined) flow.active = active;
    if (isDefault !== undefined) flow.isDefault = isDefault;
    
    await flow.save();
    
    await flow.populate('divisionId', 'name');
    await flow.populate('levels.approverRoleId', 'name');
    await flow.populate('levels.approverUserId', 'name email');
    
    res.json({
      success: true,
      data: flow,
      message: 'Flujo de aprobación actualizado exitosamente'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }
    next(error);
  }
};

/**
 * Activar/Desactivar un flujo
 */
export const toggleApprovalFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const flow = await ApprovalFlow.findOne({ _id: id, deleted: false });
    
    if (!flow) {
      res.status(404).json({
        success: false,
        message: 'Flujo de aprobación no encontrado'
      });
      return;
    }
    
    flow.active = !flow.active;
    await flow.save();
    
    res.json({
      success: true,
      data: flow,
      message: `Flujo ${flow.active ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un flujo (soft delete)
 */
export const deleteApprovalFlow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const flow = await ApprovalFlow.findOne({ _id: id, deleted: false });
    
    if (!flow) {
      res.status(404).json({
        success: false,
        message: 'Flujo de aprobación no encontrado'
      });
      return;
    }
    
    flow.deleted = true;
    flow.deletedAt = new Date();
    flow.active = false;
    await flow.save();
    
    res.json({
      success: true,
      message: 'Flujo de aprobación eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

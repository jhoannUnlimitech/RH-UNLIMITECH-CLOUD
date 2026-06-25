import { Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

/**
 * Obtener todos los proyectos
 * GET /api/v1/projects
 */
export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, division } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (division) filter.divisionId = division;

    const projects = await Project.find(filter)
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo role')
      .populate('leadId', 'name email photo')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener proyecto por ID
 * GET /api/v1/projects/:id
 */
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo role division')
      .populate('leadId', 'name email photo');

    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener mis proyectos (donde estoy asignado)
 * GET /api/v1/projects/my-projects
 */
export const getMyProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await Project.find({
      $or: [
        { members: req.user!.id },
        { leadId: req.user!.id }
      ]
    })
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo')
      .populate('leadId', 'name email photo')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear proyecto
 * POST /api/v1/projects
 */
export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, description, divisionId, status, startDate, endDate, members, leadId } = req.body;

    const existingCode = await Project.findOne({ code: code?.toUpperCase() });
    if (existingCode) {
      throw new AppError('Ya existe un proyecto con ese código', 400);
    }

    const project = await Project.create({
      name,
      code,
      description,
      divisionId,
      status: status || 'active',
      startDate,
      endDate,
      members: members || [],
      leadId
    });

    const populated = await Project.findById(project._id)
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo')
      .populate('leadId', 'name email photo');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Proyecto creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar proyecto
 * PUT /api/v1/projects/:id
 */
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    // Si actualiza código, verificar duplicado
    if (updates.code && updates.code.toUpperCase() !== project.code) {
      const existingCode = await Project.findOne({ code: updates.code.toUpperCase() });
      if (existingCode) {
        throw new AppError('Ya existe un proyecto con ese código', 400);
      }
    }

    const updated = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo')
      .populate('leadId', 'name email photo');

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Proyecto actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agregar miembro al proyecto
 * POST /api/v1/projects/:id/members
 */
export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    if (project.members.includes(employeeId)) {
      throw new AppError('El empleado ya está asignado a este proyecto', 400);
    }

    project.members.push(employeeId);
    await project.save();

    const populated = await Project.findById(id)
      .populate('divisionId', 'name code')
      .populate('members', 'name email photo role')
      .populate('leadId', 'name email photo');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Miembro agregado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remover miembro del proyecto
 * DELETE /api/v1/projects/:id/members/:employeeId
 */
export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, employeeId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    project.members = project.members.filter(m => m.toString() !== employeeId);
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Miembro removido exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar proyecto (soft delete)
 * DELETE /api/v1/projects/:id
 */
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    project.deleted = true;
    project.deletedAt = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

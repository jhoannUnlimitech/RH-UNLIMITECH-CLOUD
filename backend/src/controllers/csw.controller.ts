import { Request, Response, NextFunction } from 'express';
import CSW, { CSWStatus, ApprovalStatus } from '../models/CSW';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

/**
 * Obtener todas las solicitudes CSW con filtros
 */
export const getCSWs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      category,
      requester,
      division,
      page = 1,
      limit = 10
    } = req.query;
    
    const filter: any = { deleted: false };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (requester) filter.requester = requester;
    if (division) filter.requesterDivision = division;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [csws, total] = await Promise.all([
      CSW.find(filter)
        .populate('requester', 'name email')
        .populate('requesterDivision', 'name')
        .populate('category', 'name')
        .populate('approvalChain.approverId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CSW.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: csws,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener solicitudes pendientes de aprobación por el usuario actual
 */
export const getMyPendingApprovals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const csws = await CSW.find({
      status: CSWStatus.PENDING,
      deleted: false,
      'approvalChain.approverId': userId,
      'approvalChain.status': ApprovalStatus.PENDING
    }).populate('requester', 'name email')
      .populate('requesterDivision', 'name')
      .populate('category', 'name')
      .populate('approvalChain.approverId', 'name email')
      .sort({ createdAt: -1 });
    
    // Filtrar solo las que están en el nivel actual del usuario
    const filtered = csws.filter(csw => {
      const currentApproval = csw.approvalChain.find(
        a => a.level === csw.currentLevel
      );
      return currentApproval?.approverId.toString() === userId;
    });
    
    res.json({
      success: true,
      data: filtered,
      message: `${filtered.length} solicitudes pendientes de tu aprobación`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener solicitudes creadas por el usuario actual
 */
export const getMyRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const csws = await CSW.find({
      requester: userId,
      deleted: false
    }).populate('requesterDivision', 'name')
      .populate('category', 'name')
      .populate('approvalChain.approverId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: csws,
      message: `${csws.length} solicitudes creadas por ti`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una solicitud por ID
 */
export const getCSWById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const csw = await CSW.findOne({ _id: id, deleted: false })
      .populate('requester', 'name email')
      .populate('requesterDivision', 'name')
      .populate('category', 'name')
      .populate('approvalFlowId', 'name description')
      .populate('approvalChain.approverId', 'name email')
      .populate('history.performedBy', 'name email');
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    res.json({
      success: true,
      data: csw
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de una solicitud
 */
export const getCSWHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const csw = await CSW.findOne({ _id: id, deleted: false })
      .select('history')
      .populate('history.performedBy', 'name email');
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    res.json({
      success: true,
      data: csw.history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva solicitud CSW
 */
export const createCSW = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const { category, situation, information, solution } = req.body;
    
    // Obtener información del empleado
    const Employee = mongoose.model('Employee');
    const employee = await Employee.findById(userId)
      .populate('role', 'name')
      .populate('division', 'name');
    
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
      return;
    }
    
    // Validar que la categoría exista
    const CSWCategory = mongoose.model('CSWCategory');
    const categoryDoc = await CSWCategory.findById(category);
    
    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
      return;
    }
    
    // Crear la solicitud
    const csw = new CSW({
      situation,
      information,
      solution,
      requester: userId,
      requesterName: (employee as any).name,
      requesterPosition: (employee as any).role?.name || 'Sin cargo',
      requesterDivision: (employee as any).division._id,
      category
    });
    
    // Inicializar la cadena de aprobación
    await csw.initializeApprovalChain();
    
    await csw.populate('category', 'name');
    await csw.populate('approvalChain.approverId', 'name email');
    
    res.status(201).json({
      success: true,
      data: csw,
      message: 'Solicitud CSW creada exitosamente'
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * Editar una solicitud CSW (solo si está rechazada)
 */
export const updateCSW = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { situation, information, solution } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const csw = await CSW.findOne({ _id: id, deleted: false });
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    // Obtener nombre del usuario
    const Employee = mongoose.model('Employee');
    const employee = await Employee.findById(userId);
    
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
      return;
    }
    
    // Actualizar campos
    if (situation) csw.situation = situation;
    if (information) csw.information = information;
    if (solution) csw.solution = solution;
    
    // Resetear aprobaciones
    await csw.resetApprovals(
      new mongoose.Types.ObjectId(userId),
      (employee as any).name
    );
    
    await csw.save();
    
    await csw.populate('category', 'name');
    await csw.populate('approvalChain.approverId', 'name email');
    
    res.json({
      success: true,
      data: csw,
      message: 'Solicitud actualizada. Todas las aprobaciones fueron reseteadas.'
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * Aprobar una solicitud en el nivel actual
 */
export const approveCSW = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const csw = await CSW.findOne({ _id: id, deleted: false });
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    // Aprobar en el nivel actual
    await csw.approveAtLevel(
      new mongoose.Types.ObjectId(userId),
      csw.currentLevel,
      comments
    );
    
    await csw.populate('category', 'name');
    await csw.populate('approvalChain.approverId', 'name email');
    
    const message = csw.status === CSWStatus.APPROVED
      ? '¡Solicitud aprobada completamente!'
      : `Aprobado en nivel ${csw.currentLevel - 1}. Esperando nivel ${csw.currentLevel}`;
    
    res.json({
      success: true,
      data: csw,
      message
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * Rechazar una solicitud en el nivel actual
 */
export const rejectCSW = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    if (!comments || comments.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Los comentarios son obligatorios al rechazar'
      });
      return;
    }
    
    const csw = await CSW.findOne({ _id: id, deleted: false });
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    // Rechazar en el nivel actual
    await csw.rejectAtLevel(
      new mongoose.Types.ObjectId(userId),
      csw.currentLevel,
      comments
    );
    
    await csw.populate('category', 'name');
    await csw.populate('approvalChain.approverId', 'name email');
    
    res.json({
      success: true,
      data: csw,
      message: 'Solicitud rechazada'
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * Cancelar una solicitud (solo el solicitante)
 */
export const cancelCSW = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const csw = await CSW.findOne({ _id: id, deleted: false });
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    // Cancelar
    await csw.cancel(new mongoose.Types.ObjectId(userId), comments);
    
    await csw.populate('category', 'name');
    await csw.populate('approvalChain.approverId', 'name email');
    
    res.json({
      success: true,
      data: csw,
      message: 'Solicitud cancelada'
    });
  } catch (error: any) {
    if (error.message) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * Eliminar una solicitud (soft delete)
 */
export const deleteCSW = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const csw = await CSW.findOne({ _id: id, deleted: false });
    
    if (!csw) {
      res.status(404).json({
        success: false,
        message: 'Solicitud CSW no encontrada'
      });
      return;
    }
    
    csw.deleted = true;
    csw.deletedAt = new Date();
    await csw.save();
    
    res.json({
      success: true,
      message: 'Solicitud CSW eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de CSW
 */
export const getCSWStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await CSW.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byCategory = await CSW.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'cswcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          count: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: stats,
        byCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

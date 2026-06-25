import { Request, Response, NextFunction } from 'express';
import { CSWCategory } from '../models/CSWCategory';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Obtener todas las categorías CSW activas
 */
export const getCSWCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CSWCategory.find({
      active: true,
      deleted: false
    })
      .populate('directApproverId', 'name email')
      .sort({ order: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories,
      message: `${categories.length} categorías disponibles`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todas las categorías (incluidas inactivas)
 */
export const getAllCSWCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await CSWCategory.find({
      deleted: false
    })
      .populate('directApproverId', 'name email')
      .sort({ order: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una categoría por ID
 */
export const getCSWCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const category = await CSWCategory.findOne({ _id: id, deleted: false });
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
      return;
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva categoría
 */
export const createCSWCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, active, useDefaultFlow, directApproverId } = req.body;
    
    // Obtener el último order para asignar automáticamente la siguiente posición
    const lastCategory = await CSWCategory.findOne({ deleted: false })
      .sort({ order: -1 })
      .select('order');
    
    const nextOrder = lastCategory ? lastCategory.order + 1 : 1;
    
    const categoryData: any = {
      name,
      description,
      active: active !== undefined ? active : true,
      order: nextOrder,
      useDefaultFlow: useDefaultFlow !== undefined ? useDefaultFlow : true,
    };

    if (!categoryData.useDefaultFlow && directApproverId) {
      categoryData.directApproverId = directApproverId;
    }
    
    const category = await CSWCategory.create(categoryData);
    
    // Poblar directApproverId si existe
    const populated = await CSWCategory.findById(category._id)
      .populate('directApproverId', 'name email');
    
    res.status(201).json({
      success: true,
      data: populated,
      message: 'Categoría creada exitosamente'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
      return;
    }
    next(error);
  }
};

/**
 * Actualizar una categoría
 */
export const updateCSWCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, active, order, useDefaultFlow, directApproverId } = req.body;
    
    const category = await CSWCategory.findOne({ _id: id, deleted: false });
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
      return;
    }
    
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = active;
    if (order !== undefined) category.order = order;
    if (useDefaultFlow !== undefined) category.useDefaultFlow = useDefaultFlow;
    if (useDefaultFlow === false && directApproverId) {
      category.directApproverId = directApproverId;
    } else if (useDefaultFlow === true) {
      category.directApproverId = undefined;
    }
    
    await category.save();
    
    const populated = await CSWCategory.findById(category._id)
      .populate('directApproverId', 'name email');
    
    res.json({
      success: true,
      data: populated,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
      return;
    }
    next(error);
  }
};

/**
 * Eliminar una categoría (soft delete)
 */
export const deleteCSWCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const category = await CSWCategory.findOne({ _id: id, deleted: false });
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
      return;
    }
    
    category.deleted = true;
    category.deletedAt = new Date();
    await category.save();
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

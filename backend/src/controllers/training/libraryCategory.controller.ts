import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { libraryCategoryService } from '../../services/training/libraryCategory.service';

/**
 * LibraryCategoryController — Manejo HTTP para categorías de la Biblioteca.
 *
 * Solo parsea request y envía response. Toda la lógica vive en el service.
 */

/** GET /api/v1/library/categories */
export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parent = req.query.parent as string | undefined;
    const includeDeleted = req.query.includeDeleted === 'true';

    let categories;
    if (parent === 'root' || parent === 'null') {
      categories = await libraryCategoryService.getRoots(includeDeleted);
    } else if (parent) {
      categories = await libraryCategoryService.getChildren(parent);
    } else {
      categories = await libraryCategoryService.getAll(includeDeleted);
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/library/categories/:id */
export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await libraryCategoryService.getById(id);
    const children = await libraryCategoryService.getChildren(id);

    res.json({ success: true, data: { category, children } });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/library/categories */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await libraryCategoryService.create(req.body, req.user!.id);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/library/categories/:id */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await libraryCategoryService.update(id, req.body);

    res.json({
      success: true,
      data: category,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/library/categories/reorder */
export const reorderCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await libraryCategoryService.reorder(req.body.categories);

    res.json({
      success: true,
      message: 'Categorías reordenadas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/v1/library/categories/:id */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const force = req.query.force === 'true';
    const result = await libraryCategoryService.delete(id, force);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      deactivatedDocs: result.deactivatedDocs
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/library/categories/:id/restore */
export const restoreCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await libraryCategoryService.restore(id);

    res.json({
      success: true,
      data: category,
      message: 'Categoría restaurada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/v1/library/categories/:id/permanent */
export const hardDeleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await libraryCategoryService.hardDelete(id);

    res.json({
      success: true,
      message: 'Categoría eliminada permanentemente'
    });
  } catch (error) {
    next(error);
  }
};

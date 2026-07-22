import { Types } from 'mongoose';
import { LibraryCategory, ILibraryCategory } from '../../models/training/LibraryCategory';
import { AppError } from '../../middleware/error';

/**
 * LibraryCategoryService — Lógica de negocio para categorías de la Biblioteca.
 *
 * Responsabilidades: CRUD, validaciones de negocio, cálculos de profundidad,
 * reordenamiento, y manejo del árbol jerárquico. Los controllers solo
 * llaman a estos métodos sin conocer la lógica interna.
 */

/** Genera un slug URL-friendly a partir de un nombre */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent?: string;
  order?: number;
  active?: boolean;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string | null;
  parent?: string;
  order?: number;
  active?: boolean;
}

interface ReorderInput {
  id: string;
  order: number;
}

class LibraryCategoryService {

  /**
   * Obtener todas las categorías en estructura de árbol.
   * Devuelve las categorías raíz con sus hijos anidados.
   */
  async getAll(includeDeleted = false): Promise<ILibraryCategory[]> {
    const query = LibraryCategory.find()
      .populate('parent', 'name slug')
      .populate('createdBy', 'name')
      .sort({ depth: 1, order: 1 });
    
    if (includeDeleted) query.setOptions({ includeDeleted: true });
    return query;
  }

  /**
   * Obtener categorías raíz (depth = 0).
   */
  async getRoots(includeDeleted = false): Promise<ILibraryCategory[]> {
    const query = LibraryCategory.find({ parent: null })
      .populate('createdBy', 'name')
      .sort({ order: 1 });
    
    if (includeDeleted) query.setOptions({ includeDeleted: true });
    return query;
  }

  /**
   * Obtener hijos directos de una categoría.
   */
  async getChildren(parentId: string): Promise<ILibraryCategory[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new AppError('ID de categoría padre no válido', 400);
    }
    return LibraryCategory.find({ parent: parentId })
      .populate('createdBy', 'name')
      .sort({ order: 1 });
  }

  /**
   * Obtener una categoría por ID con sus hijos.
   */
  async getById(id: string): Promise<ILibraryCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de categoría no válido', 400);
    }

    const category = await LibraryCategory.findById(id)
      .populate('parent', 'name slug')
      .populate('createdBy', 'name');

    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return category;
  }

  /**
   * Crear una nueva categoría.
   * Calcula depth automáticamente basado en el parent.
   */
  async create(data: CreateCategoryInput, createdBy: string): Promise<ILibraryCategory> {
    // Validar parent si se proporciona
    if (data.parent) {
      if (!Types.ObjectId.isValid(data.parent)) {
        throw new AppError('ID de categoría padre no válido', 400);
      }
      const parent = await LibraryCategory.findById(data.parent);
      if (!parent) {
        throw new AppError('Categoría padre no encontrada', 404);
      }
      if (parent.depth >= 4) {
        throw new AppError('No se puede crear más de 5 niveles de profundidad', 400);
      }
    }

    // Si no se proporciona order, asignar el siguiente disponible
    if (data.order === undefined || data.order === null) {
      const lastSibling = await LibraryCategory.findOne({ parent: data.parent || null })
        .sort({ order: -1 });
      data.order = lastSibling ? lastSibling.order + 1 : 0;
    }

    // Generar slug único
    let slug = generateSlug(data.name);
    const existingSlug = await LibraryCategory.findOne({ slug }).setOptions({ includeDeleted: true });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Calcular depth
    let depth = 0;
    if (data.parent) {
      const parentDoc = await LibraryCategory.findById(data.parent);
      depth = parentDoc ? parentDoc.depth + 1 : 0;
    }

    const category = new LibraryCategory({
      ...data,
      slug,
      depth,
      parent: data.parent || null,
      createdBy,
    });
    await category.save();
    await category.populate('createdBy', 'name');

    return category;
  }

  /**
   * Actualizar una categoría existente.
   * No permite modificar categorías del sistema (isSystem).
   */
  async update(id: string, data: UpdateCategoryInput): Promise<ILibraryCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de categoría no válido', 400);
    }

    const category = await LibraryCategory.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Las categorías del sistema solo permiten cambiar description, icon, color, order
    if (category.isSystem && data.name && data.name !== category.name) {
      throw new AppError('No se puede cambiar el nombre de una categoría del sistema', 400);
    }

    // Si cambia el parent, validar el nuevo parent
    if (data.parent !== undefined) {
      if (data.parent && data.parent === id) {
        throw new AppError('Una categoría no puede ser su propio padre', 400);
      }
      if (data.parent) {
        const newParent = await LibraryCategory.findById(data.parent);
        if (!newParent) {
          throw new AppError('Nueva categoría padre no encontrada', 404);
        }
        // Evitar ciclos: el nuevo parent no puede ser un descendiente
        const isDescendant = await this.isDescendantOf(data.parent, id);
        if (isDescendant) {
          throw new AppError('No se puede mover a un descendiente propio (ciclo)', 400);
        }
      }
    }

    // Aplicar cambios
    Object.assign(category, data);
    if (data.parent === null || data.parent === '') {
      category.parent = undefined;
    }

    await category.save();

    // Si se desactiva una categoría padre, desactivar también sus hijas
    if (data.active === false) {
      await LibraryCategory.updateMany(
        { parent: category._id },
        { $set: { active: false } }
      );
    }

    return category.populate('createdBy', 'name');
  }

  /**
   * Eliminar una categoría (soft delete).
   * Si force=true y tiene documentos, los desactiva (unpublish) antes de eliminar.
   */
  async delete(id: string, force = false): Promise<{ deactivatedDocs: number; deactivatedCategories: number }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de categoría no válido', 400);
    }

    const category = await LibraryCategory.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (category.isSystem) {
      throw new AppError('No se puede eliminar una categoría del sistema', 400);
    }

    const { LibraryDocument } = await import('../../models/training/LibraryDocument');

    // 1. Recoger sub-categorías descendientes (recursivo)
    const allChildIds = await this.getAllDescendantIds(id);
    const allCategoryIds = [id, ...allChildIds];

    // 2. Buscar documentos activos en TODAS las categorías afectadas
    const affectedDocs = await LibraryDocument.find(
      { category: { $in: allCategoryIds }, deleted: { $ne: true } }
    ).select('title slug');

    // 3. Buscar sub-categorías afectadas
    const affectedChildren = await LibraryCategory.find(
      { _id: { $in: allChildIds }, deleted: { $ne: true } }
    ).select('name slug');

    // Si hay dependientes y no es force → devolver preview de afectados (409)
    if (!force && (affectedChildren.length > 0 || affectedDocs.length > 0)) {
      throw new AppError(
        JSON.stringify({
          message: `La categoría "${category.name}" tiene dependencias`,
          subcategories: affectedChildren.map(c => ({ name: c.name, slug: c.slug })),
          documents: affectedDocs.map(d => ({ title: d.title, slug: d.slug })),
          canForce: true,
        }),
        409
      );
    }

    // 4. Ejecutar cascada: desactivar (unpublish) documentos
    let deactivatedDocs = 0;
    if (affectedDocs.length > 0) {
      const docsResult = await LibraryDocument.updateMany(
        { category: { $in: allCategoryIds }, deleted: { $ne: true }, published: true },
        { $set: { published: false } }
      );
      deactivatedDocs = docsResult.modifiedCount;
    }

    // 5. Soft-delete sub-categorías
    let deactivatedCategories = 0;
    if (allChildIds.length > 0) {
      const catsResult = await LibraryCategory.updateMany(
        { _id: { $in: allChildIds } },
        { $set: { active: false, deleted: true, deletedAt: new Date() } }
      );
      deactivatedCategories = catsResult.modifiedCount;
    }

    // 6. Soft-delete la categoría padre
    category.active = false;
    await category.softDelete();
    return { deactivatedDocs, deactivatedCategories };
  }

  /**
   * Reordenar categorías (actualizar el campo order de múltiples categorías).
   */
  async reorder(items: ReorderInput[]): Promise<void> {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.id) },
        update: { $set: { order: item.order } }
      }
    }));

    await LibraryCategory.bulkWrite(bulkOps);
  }

  /**
   * Incrementar documentsCount (+1 al crear un doc en esta categoría).
   */
  async incrementDocumentsCount(categoryId: string): Promise<void> {
    await LibraryCategory.findByIdAndUpdate(categoryId, { $inc: { documentsCount: 1 } });
  }

  /**
   * Decrementar documentsCount (-1 al eliminar un doc de esta categoría).
   */
  async decrementDocumentsCount(categoryId: string): Promise<void> {
    await LibraryCategory.findByIdAndUpdate(categoryId, { $inc: { documentsCount: -1 } });
  }

  /**
   * Obtener todos los IDs de sub-categorías descendientes (recursivo, BFS).
   */
  private async getAllDescendantIds(parentId: string): Promise<string[]> {
    const result: string[] = [];
    const queue = [parentId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await LibraryCategory.find({ parent: currentId, deleted: { $ne: true } }).select('_id');
      for (const child of children) {
        const childId = child._id.toString();
        result.push(childId);
        queue.push(childId);
      }
    }

    return result;
  }

  /**
   * Verificar si targetId es un descendiente de ancestorId (para evitar ciclos).
   */
  private async isDescendantOf(targetId: string, ancestorId: string): Promise<boolean> {
    let currentId: string | null = targetId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === ancestorId) return true;
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const found: ILibraryCategory | null = await LibraryCategory.findById(currentId).select('parent');
      currentId = found?.parent ? found.parent.toString() : null;
    }

    return false;
  }

  /**
   * Restaurar una categoría eliminada (soft-deleted → active).
   */
  async restore(id: string): Promise<ILibraryCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de categoría no válido', 400);
    }

    const category = await LibraryCategory.findById(id).setOptions({ includeDeleted: true });
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (!category.deleted) {
      throw new AppError('La categoría no está eliminada', 400);
    }

    category.deleted = false;
    category.deletedAt = undefined;
    category.active = true;
    await category.save();

    return category;
  }

  /**
   * Eliminar permanentemente (hard delete) una categoría.
   * Solo funciona con categorías que ya están soft-deleted.
   */
  async hardDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de categoría no válido', 400);
    }

    const category = await LibraryCategory.findById(id).setOptions({ includeDeleted: true });
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (!category.deleted) {
      throw new AppError('Solo se pueden eliminar permanentemente categorías que ya están en la papelera', 400);
    }

    if (category.isSystem) {
      throw new AppError('No se puede eliminar permanentemente una categoría del sistema', 400);
    }

    const { LibraryDocument } = await import('../../models/training/LibraryDocument');
    const docsCount = await LibraryDocument.countDocuments({ category: id });
    if (docsCount > 0) {
      throw new AppError(
        `No se puede eliminar permanentemente. Aún tiene ${docsCount} documento(s) asociado(s).`,
        400
      );
    }

    await LibraryCategory.deleteOne({ _id: id });
  }
}

export const libraryCategoryService = new LibraryCategoryService();

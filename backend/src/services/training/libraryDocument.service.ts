import { Types } from 'mongoose';
import { LibraryDocument, ILibraryDocument } from '../../models/training/LibraryDocument';
import { LibraryDocumentVersion } from '../../models/training/LibraryDocumentVersion';
import { LibraryCategory } from '../../models/training/LibraryCategory';
import { libraryCategoryService } from './libraryCategory.service';
import { AppError } from '../../middleware/error';

/**
 * LibraryDocumentService — Lógica de negocio para documentos de la Biblioteca.
 *
 * Responsabilidades: CRUD, versionado automático, búsqueda por título+tags,
 * publicación, incremento de vistas, y restauración de versiones.
 */

interface CreateDocumentInput {
  title: string;
  description?: string;
  category: string;
  type: 'article' | 'link' | 'file' | 'mixed';
  content?: string;
  externalLink?: string;
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  tags?: string[];
  visibility?: 'all' | 'specific_roles' | 'specific_divisions';
  visibleToRoles?: string[];
  visibleToDivisions?: string[];
  published?: boolean;
  featured?: boolean;
  order?: number;
}

interface UpdateDocumentInput {
  title?: string;
  description?: string;
  category?: string;
  type?: 'article' | 'link' | 'file' | 'mixed';
  content?: string;
  externalLink?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileMimeType?: string | null;
  tags?: string[];
  changeNote?: string;
  visibility?: 'all' | 'specific_roles' | 'specific_divisions';
  visibleToRoles?: string[];
  visibleToDivisions?: string[];
  published?: boolean;
  featured?: boolean;
  order?: number;
}

interface DocumentFilters {
  category?: string;
  type?: string;
  published?: boolean;
  featured?: boolean;
  author?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

class LibraryDocumentService {

  /**
   * Listar documentos con filtros y paginación.
   */
  async getAll(filters: DocumentFilters): Promise<{ documents: ILibraryDocument[]; total: number; pages: number }> {
    const query: any = {};

    // Si se filtra por categoría, incluir también documentos de sub-categorías
    if (filters.category) {
      const childCategories = await LibraryCategory.find({ parent: filters.category }).select('_id');
      const categoryIds = [filters.category, ...childCategories.map(c => c._id.toString())];
      query.category = { $in: categoryIds };
    }
    if (filters.type) query.type = filters.type;
    if (filters.published !== undefined) query.published = filters.published;
    if (filters.featured !== undefined) query.featured = filters.featured;
    if (filters.author) query.author = filters.author;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      LibraryDocument.find(query)
        .setOptions(filters.includeDeleted ? { includeDeleted: true } : {})
        .populate('category', 'name slug icon color')
        .populate('author', 'name email')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LibraryDocument.countDocuments(query)
    ]);

    return { documents, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Obtener un documento por slug.
   */
  async getBySlug(slug: string): Promise<ILibraryDocument> {
    const document = await LibraryDocument.findOne({ slug })
      .populate('category', 'name slug icon color')
      .populate('author', 'name email');

    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    return document;
  }

  /**
   * Obtener un documento por ID.
   */
  async getById(id: string): Promise<ILibraryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email');

    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    return document;
  }

  /**
   * Crear un nuevo documento.
   * Incrementa documentsCount de la categoría.
   */
  async create(data: CreateDocumentInput, authorId: string): Promise<ILibraryDocument> {
    // Validar que la categoría existe
    if (!Types.ObjectId.isValid(data.category)) {
      throw new AppError('ID de categoría no válido', 400);
    }
    const category = await LibraryCategory.findById(data.category);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Validar contenido según tipo
    this.validateContentByType(data);

    const document = new LibraryDocument({
      ...data,
      author: authorId,
      version: 1,
    });
    await document.save();

    // Incrementar contador de documentos en la categoría
    await libraryCategoryService.incrementDocumentsCount(data.category);

    // Crear primera versión en historial (si tiene contenido)
    if (data.content) {
      const versionDoc = new LibraryDocumentVersion({
        document: document._id,
        version: 1,
        content: data.content,
        editedBy: authorId,
        changeNote: 'Versión inicial',
      });
      await versionDoc.save();
    }

    await document.populate('category', 'name slug icon color');
    await document.populate('author', 'name email');

    return document;
  }

  /**
   * Actualizar un documento existente.
   * Si el contenido cambió, crea una nueva versión en el historial.
   */
  async update(id: string, data: UpdateDocumentInput, editorId: string): Promise<ILibraryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id);
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    // Si cambia de categoría, actualizar contadores
    if (data.category && data.category !== document.category.toString()) {
      if (!Types.ObjectId.isValid(data.category)) {
        throw new AppError('ID de nueva categoría no válido', 400);
      }
      const newCategory = await LibraryCategory.findById(data.category);
      if (!newCategory) {
        throw new AppError('Nueva categoría no encontrada', 404);
      }
      // Decrementar la anterior, incrementar la nueva
      await libraryCategoryService.decrementDocumentsCount(document.category.toString());
      await libraryCategoryService.incrementDocumentsCount(data.category);
    }

    // Si el contenido cambió, crear nueva versión
    const contentChanged = data.content !== undefined && data.content !== document.content;
    if (contentChanged) {
      document.version += 1;
      const versionDoc = new LibraryDocumentVersion({
        document: document._id,
        version: document.version,
        content: data.content!,
        editedBy: editorId,
        changeNote: data.changeNote || `Versión ${document.version}`,
      });
      await versionDoc.save();
    }

    // Aplicar cambios (excluir changeNote que no es campo del documento)
    const { changeNote, ...updateData } = data;
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        (document as any)[key] = value === null ? undefined : value;
      }
    });

    await document.save();
    await document.populate('category', 'name slug icon color');
    await document.populate('author', 'name email');

    return document;
  }

  /**
   * Eliminar un documento (soft delete).
   * Decrementa documentsCount de la categoría.
   */
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id);
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    await document.softDelete();
    await libraryCategoryService.decrementDocumentsCount(document.category.toString());
  }

  /**
   * Eliminar permanentemente un documento (hard delete).
   * Solo permite eliminar documentos que ya estén soft-deleted.
   */
  async hardDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id).setOptions({ includeDeleted: true });
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    if (!document.deleted) {
      throw new AppError('Solo se pueden eliminar permanentemente documentos ya eliminados (papelera)', 400);
    }

    // Eliminar versiones asociadas
    const { LibraryDocumentVersion } = await import('../../models/training/LibraryDocumentVersion');
    await LibraryDocumentVersion.deleteMany({ document: id });

    // Eliminar permanentemente
    await LibraryDocument.deleteOne({ _id: id });
  }

  /**
   * Restaurar un documento soft-deleted (vuelve como borrador no publicado).
   */
  async restore(id: string): Promise<ILibraryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id).setOptions({ includeDeleted: true });
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    if (!document.deleted) {
      throw new AppError('El documento no está eliminado', 400);
    }

    document.deleted = false;
    document.deletedAt = undefined;
    document.published = false; // Restaurar como borrador
    await document.save();

    // Incrementar contador de la categoría
    await libraryCategoryService.incrementDocumentsCount(document.category.toString());

    await document.populate('category', 'name slug icon color');
    await document.populate('author', 'name email');

    return document;
  }

  /**
   * Publicar o despublicar un documento.
   */
  async setPublished(id: string, published: boolean): Promise<ILibraryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id);
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    document.published = published;
    if (published && !document.publishedAt) {
      document.publishedAt = new Date();
    }
    await document.save();
    await document.populate('category', 'name slug icon color');
    await document.populate('author', 'name email');

    return document;
  }

  /**
   * Marcar/desmarcar como destacado.
   */
  async setFeatured(id: string, featured: boolean): Promise<ILibraryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de documento no válido', 400);
    }

    const document = await LibraryDocument.findById(id);
    if (!document) {
      throw new AppError('Documento no encontrado', 404);
    }

    document.featured = featured;
    await document.save();
    await document.populate('category', 'name slug icon color');
    await document.populate('author', 'name email');

    return document;
  }

  /**
   * Incrementar contador de vistas.
   */
  async incrementViewCount(id: string): Promise<void> {
    await LibraryDocument.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  /**
   * Obtener historial de versiones de un documento.
   */
  async getVersions(documentId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new AppError('ID de documento no válido', 400);
    }

    return LibraryDocumentVersion.find({ document: documentId })
      .populate('editedBy', 'name email')
      .sort({ version: -1 });
  }

  /**
   * Obtener una versión específica.
   */
  async getVersion(documentId: string, version: number): Promise<any> {
    const versionDoc = await LibraryDocumentVersion.findOne({
      document: documentId,
      version,
    }).populate('editedBy', 'name email');

    if (!versionDoc) {
      throw new AppError(`Versión ${version} no encontrada`, 404);
    }

    return versionDoc;
  }

  /**
   * Restaurar una versión anterior (crea una nueva versión con el contenido antiguo).
   */
  async restoreVersion(documentId: string, version: number, restoredBy: string): Promise<ILibraryDocument> {
    const versionDoc = await LibraryDocumentVersion.findOne({
      document: documentId,
      version,
    });

    if (!versionDoc) {
      throw new AppError(`Versión ${version} no encontrada`, 404);
    }

    // Actualizar el documento con el contenido de la versión restaurada
    return this.update(documentId, {
      content: versionDoc.content,
      changeNote: `Restaurado desde versión ${version}`,
    }, restoredBy);
  }

  /**
   * Búsqueda por título y tags (D16: solo título + tags para v1).
   */
  async search(query: string, filters?: { category?: string; type?: string }): Promise<ILibraryDocument[]> {
    const searchQuery: any = {
      published: true,
      $text: { $search: query },
    };

    if (filters?.category) searchQuery.category = filters.category;
    if (filters?.type) searchQuery.type = filters.type;

    return LibraryDocument.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('category', 'name slug icon color')
      .populate('author', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  /**
   * Validar que el contenido corresponda al tipo de documento.
   */
  private validateContentByType(data: CreateDocumentInput): void {
    switch (data.type) {
      case 'article':
        if (!data.content || data.content.trim() === '') {
          throw new AppError('Un documento tipo "artículo" requiere contenido', 400);
        }
        break;
      case 'link':
        if (!data.externalLink) {
          throw new AppError('Un documento tipo "link" requiere una URL externa', 400);
        }
        break;
      case 'file':
        if (!data.fileUrl) {
          throw new AppError('Un documento tipo "archivo" requiere un archivo adjunto', 400);
        }
        break;
      case 'mixed':
        // Al menos uno de los campos debe tener contenido
        if (!data.content && !data.externalLink && !data.fileUrl) {
          throw new AppError('Un documento tipo "mixto" requiere al menos un tipo de contenido', 400);
        }
        break;
    }
  }
}

export const libraryDocumentService = new LibraryDocumentService();

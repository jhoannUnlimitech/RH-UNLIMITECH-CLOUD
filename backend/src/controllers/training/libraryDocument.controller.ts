import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { libraryDocumentService } from '../../services/training/libraryDocument.service';

/**
 * LibraryDocumentController — Manejo HTTP para documentos de la Biblioteca.
 *
 * Solo parsea request y envía response. Toda la lógica vive en el service.
 */

/** GET /api/v1/library/documents */
export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, type, published, featured, author, page, limit } = req.query;

    const result = await libraryDocumentService.getAll({
      category: category as string,
      type: type as string,
      published: published === 'true' ? true : published === 'false' ? false : undefined,
      featured: featured === 'true' ? true : undefined,
      author: author as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json({
      success: true,
      data: result.documents,
      pagination: { total: result.total, pages: result.pages }
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/library/documents/:slug */
export const getDocumentBySlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const document = await libraryDocumentService.getBySlug(slug);

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/library/documents */
export const createDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const document = await libraryDocumentService.create(req.body, req.user!.id);

    res.status(201).json({
      success: true,
      data: document,
      message: 'Documento creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/library/documents/:id */
export const updateDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const document = await libraryDocumentService.update(id, req.body, req.user!.id);

    res.json({
      success: true,
      data: document,
      message: 'Documento actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/library/documents/:id/publish */
export const publishDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const document = await libraryDocumentService.setPublished(id, req.body.published);

    res.json({
      success: true,
      data: document,
      message: req.body.published ? 'Documento publicado' : 'Documento despublicado'
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/v1/library/documents/:id/feature */
export const featureDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const document = await libraryDocumentService.setFeatured(id, req.body.featured);

    res.json({
      success: true,
      data: document,
      message: req.body.featured ? 'Documento destacado' : 'Documento quitado de destacados'
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/library/documents/:id/view */
export const registerView = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await libraryDocumentService.incrementViewCount(id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/library/documents/:id/versions */
export const getVersions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const versions = await libraryDocumentService.getVersions(id);

    res.json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/library/documents/:id/versions/:version */
export const getVersion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const version = Number(req.params.version);
    const versionDoc = await libraryDocumentService.getVersion(id, version);

    res.json({ success: true, data: versionDoc });
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/library/documents/:id/restore-version/:version */
export const restoreVersion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const version = Number(req.params.version);
    const document = await libraryDocumentService.restoreVersion(id, version, req.user!.id);

    res.json({
      success: true,
      data: document,
      message: `Documento restaurado a versión ${version}`
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/v1/library/documents/:id */
export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await libraryDocumentService.delete(id);

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/v1/library/search */
export const searchDocuments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      res.json({ success: true, data: [] });
      return;
    }

    const documents = await libraryDocumentService.search(q, {
      category: req.query.category as string,
      type: req.query.type as string,
    });

    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

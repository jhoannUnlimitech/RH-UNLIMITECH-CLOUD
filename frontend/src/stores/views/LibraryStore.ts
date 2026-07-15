import { makeAutoObservable, runInAction } from 'mobx';
import { libraryService, LibraryCategory, LibraryDocument } from '../../api/services/library';
import { notify } from '../../utils/toast';

/**
 * LibraryStore — Estado global de la Biblioteca documental.
 *
 * Maneja categorías, documentos, búsqueda y estado de la UI.
 */

class LibraryStore {
  categories: LibraryCategory[] = [];
  documents: LibraryDocument[] = [];
  selectedCategory: LibraryCategory | null = null;
  selectedDocument: LibraryDocument | null = null;
  searchResults: LibraryDocument[] = [];
  isLoading = false;
  error: string | null = null;
  pagination = { total: 0, pages: 0 };

  constructor() {
    makeAutoObservable(this);
  }

  // --- Categorías ---

  async fetchCategories(parent?: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const categories = await libraryService.getCategories(parent);
      runInAction(() => { this.categories = categories; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar categorías'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchCategoryById(id: string) {
    this.isLoading = true;
    try {
      const { category } = await libraryService.getCategoryById(id);
      runInAction(() => { this.selectedCategory = category; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar categoría'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createCategory(data: Partial<LibraryCategory>) {
    try {
      const category = await libraryService.createCategory(data);
      runInAction(() => { this.categories.push(category); });
      notify.success('Categoría creada exitosamente');
      return category;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al crear categoría');
      throw err;
    }
  }

  async updateCategory(id: string, data: Partial<LibraryCategory>) {
    try {
      const updated = await libraryService.updateCategory(id, data);
      runInAction(() => {
        const idx = this.categories.findIndex(c => c._id === id);
        if (idx !== -1) this.categories[idx] = updated;
      });
      notify.success('Categoría actualizada');
      return updated;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al actualizar categoría');
      throw err;
    }
  }

  async deleteCategory(id: string) {
    try {
      await libraryService.deleteCategory(id);
      runInAction(() => { this.categories = this.categories.filter(c => c._id !== id); });
      notify.success('Categoría eliminada');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar categoría');
      throw err;
    }
  }

  // --- Documentos ---

  async fetchDocuments(filters?: Record<string, string>) {
    this.isLoading = true;
    this.error = null;
    try {
      const result = await libraryService.getDocuments(filters);
      runInAction(() => {
        this.documents = result.documents;
        this.pagination = { total: result.total, pages: result.pages };
      });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar documentos'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchDocumentBySlug(slug: string) {
    this.isLoading = true;
    try {
      const document = await libraryService.getDocumentBySlug(slug);
      runInAction(() => { this.selectedDocument = document; });
      // Registrar vista
      libraryService.registerView(document._id).catch(() => {});
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Documento no encontrado'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createDocument(data: Partial<LibraryDocument>) {
    try {
      const document = await libraryService.createDocument(data);
      runInAction(() => { this.documents.unshift(document); });
      notify.success('Documento creado exitosamente');
      return document;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al crear documento');
      throw err;
    }
  }

  async updateDocument(id: string, data: Partial<LibraryDocument> & { changeNote?: string }) {
    try {
      const updated = await libraryService.updateDocument(id, data);
      runInAction(() => {
        const idx = this.documents.findIndex(d => d._id === id);
        if (idx !== -1) this.documents[idx] = updated;
        if (this.selectedDocument?._id === id) this.selectedDocument = updated;
      });
      notify.success('Documento actualizado');
      return updated;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al actualizar documento');
      throw err;
    }
  }

  async deleteDocument(id: string) {
    try {
      await libraryService.deleteDocument(id);
      runInAction(() => { this.documents = this.documents.filter(d => d._id !== id); });
      notify.success('Documento eliminado');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar documento');
      throw err;
    }
  }

  async publishDocument(id: string, published: boolean) {
    try {
      const updated = await libraryService.publishDocument(id, published);
      runInAction(() => {
        const idx = this.documents.findIndex(d => d._id === id);
        if (idx !== -1) this.documents[idx] = updated;
      });
      notify.success(published ? 'Documento publicado' : 'Documento despublicado');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error');
      throw err;
    }
  }

  // --- Búsqueda ---

  async search(query: string, filters?: { category?: string; type?: string }) {
    this.isLoading = true;
    try {
      const results = await libraryService.searchDocuments(query, filters);
      runInAction(() => { this.searchResults = results; });
    } catch (err: any) {
      runInAction(() => { this.searchResults = []; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  clearError() {
    this.error = null;
  }
}

export const libraryStore = new LibraryStore();

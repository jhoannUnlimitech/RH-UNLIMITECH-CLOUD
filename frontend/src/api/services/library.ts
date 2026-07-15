import apiClient from '../client';

/**
 * LibraryService — API client para la Biblioteca documental.
 */

export interface LibraryCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent?: string | { _id: string; name: string; slug: string };
  order: number;
  depth: number;
  isSystem: boolean;
  documentsCount: number;
  active: boolean;
  createdBy: string | { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface LibraryDocument {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string | { _id: string; name: string; slug: string; icon?: string; color?: string };
  type: 'article' | 'link' | 'file' | 'mixed';
  content?: string;
  externalLink?: string;
  fileUrl?: string;
  fileName?: string;
  author: string | { _id: string; name: string; email: string };
  version: number;
  tags: string[];
  visibility: 'all' | 'specific_roles' | 'specific_divisions';
  published: boolean;
  publishedAt?: string;
  featured: boolean;
  order: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  _id: string;
  document: string;
  version: number;
  content: string;
  editedBy: string | { _id: string; name: string };
  changeNote?: string;
  createdAt: string;
}

class LibraryService {
  private readonly baseURL = '/library';

  // --- Categorías ---

  async getCategories(parent?: string): Promise<LibraryCategory[]> {
    const params = parent ? `?parent=${parent}` : '';
    const res = await apiClient.get<{ success: boolean; data: LibraryCategory[] }>(`${this.baseURL}/categories${params}`);
    return res.data.data;
  }

  async getCategoryById(id: string): Promise<{ category: LibraryCategory; children: LibraryCategory[] }> {
    const res = await apiClient.get<{ success: boolean; data: { category: LibraryCategory; children: LibraryCategory[] } }>(`${this.baseURL}/categories/${id}`);
    return res.data.data;
  }

  async createCategory(data: Partial<LibraryCategory>): Promise<LibraryCategory> {
    const res = await apiClient.post<{ success: boolean; data: LibraryCategory }>(`${this.baseURL}/categories`, data);
    return res.data.data;
  }

  async updateCategory(id: string, data: Partial<LibraryCategory>): Promise<LibraryCategory> {
    const res = await apiClient.put<{ success: boolean; data: LibraryCategory }>(`${this.baseURL}/categories/${id}`, data);
    return res.data.data;
  }

  async reorderCategories(categories: { id: string; order: number }[]): Promise<void> {
    await apiClient.put(`${this.baseURL}/categories/reorder`, { categories });
  }

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/categories/${id}`);
  }

  // --- Documentos ---

  async getDocuments(filters?: Record<string, string>): Promise<{ documents: LibraryDocument[]; total: number; pages: number }> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiClient.get<{ success: boolean; data: LibraryDocument[]; pagination: { total: number; pages: number } }>(`${this.baseURL}/documents${params}`);
    return { documents: res.data.data, total: res.data.pagination.total, pages: res.data.pagination.pages };
  }

  async getDocumentBySlug(slug: string): Promise<LibraryDocument> {
    const res = await apiClient.get<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents/${slug}`);
    return res.data.data;
  }

  async createDocument(data: Partial<LibraryDocument>): Promise<LibraryDocument> {
    const res = await apiClient.post<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents`, data);
    return res.data.data;
  }

  async updateDocument(id: string, data: Partial<LibraryDocument> & { changeNote?: string }): Promise<LibraryDocument> {
    const res = await apiClient.put<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents/${id}`, data);
    return res.data.data;
  }

  async publishDocument(id: string, published: boolean): Promise<LibraryDocument> {
    const res = await apiClient.put<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents/${id}/publish`, { published });
    return res.data.data;
  }

  async featureDocument(id: string, featured: boolean): Promise<LibraryDocument> {
    const res = await apiClient.put<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents/${id}/feature`, { featured });
    return res.data.data;
  }

  async registerView(id: string): Promise<void> {
    await apiClient.post(`${this.baseURL}/documents/${id}/view`);
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const res = await apiClient.get<{ success: boolean; data: DocumentVersion[] }>(`${this.baseURL}/documents/${documentId}/versions`);
    return res.data.data;
  }

  async restoreVersion(documentId: string, version: number): Promise<LibraryDocument> {
    const res = await apiClient.post<{ success: boolean; data: LibraryDocument }>(`${this.baseURL}/documents/${documentId}/restore-version/${version}`);
    return res.data.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/documents/${id}`);
  }

  async searchDocuments(q: string, filters?: { category?: string; type?: string }): Promise<LibraryDocument[]> {
    const params = new URLSearchParams({ q });
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    const res = await apiClient.get<{ success: boolean; data: LibraryDocument[] }>(`${this.baseURL}/search?${params}`);
    return res.data.data;
  }
}

export const libraryService = new LibraryService();

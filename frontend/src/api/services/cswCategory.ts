import apiClient from '../client';

export interface ICSWCategory {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
  order: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICSWCategoryInput {
  name: string;
  description?: string;
  active?: boolean;
  order?: number;
}

class CSWCategoryService {
  private readonly baseURL = '/csw-categories';

  /**
   * Obtener todas las categorías activas
   */
  async getAll(): Promise<ICSWCategory[]> {
    const response = await apiClient.get<{ success: boolean; data: ICSWCategory[] }>(this.baseURL);
    return response.data.data;
  }

  /**
   * Obtener todas las categorías (incluidas inactivas)
   */
  async getAllIncludingInactive(): Promise<ICSWCategory[]> {
    const response = await apiClient.get<{ success: boolean; data: ICSWCategory[] }>(`${this.baseURL}/all`);
    return response.data.data;
  }

  /**
   * Obtener una categoría por ID
   */
  async getById(id: string): Promise<ICSWCategory> {
    const response = await apiClient.get<{ success: boolean; data: ICSWCategory }>(`${this.baseURL}/${id}`);
    return response.data.data;
  }

  /**
   * Crear una nueva categoría
   */
  async create(data: ICSWCategoryInput): Promise<ICSWCategory> {
    const response = await apiClient.post<{ success: boolean; data: ICSWCategory }>(this.baseURL, data);
    return response.data.data;
  }

  /**
   * Actualizar una categoría existente
   */
  async update(id: string, data: ICSWCategoryInput): Promise<ICSWCategory> {
    const response = await apiClient.put<{ success: boolean; data: ICSWCategory }>(`${this.baseURL}/${id}`, data);
    return response.data.data;
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }
}

export const cswCategoryService = new CSWCategoryService();

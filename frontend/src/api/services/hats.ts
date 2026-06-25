import apiClient from '../client';
import { IHatsStore } from '../../stores/views/HatsStore.contract';

export interface Hat {
  _id: string;
  name: string;
  permissions: Array<{
    _id: string;
    resource: string;
    action: string;
  }>;
  employeesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const hatsService = {
  /**
   * Obtener todos los hats
   */
  async getAll(params?: IHatsStore.FetchParams): Promise<any> {
    const response = await apiClient.get('/roles', { params });
    return response.data.data || response.data;
  },

  /**
   * Obtener un hat por ID
   */
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Crear un nuevo hat
   */
  async create(data: IHatsStore.RoleInput): Promise<any> {
    const response = await apiClient.post('/roles', data);
    return response.data.data || response.data;
  },

  /**
   * Actualizar un hat existente
   */
  async update(id: string, data: IHatsStore.RoleUpdateInput): Promise<any> {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Eliminar un hat
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};

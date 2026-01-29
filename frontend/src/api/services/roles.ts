import apiClient from '../client';
import { IRolesStore } from '../../stores/views/RolesStore.contract';

export interface Role {
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

export const rolesService = {
  /**
   * Obtener todos los roles
   */
  async getAll(params?: IRolesStore.FetchParams): Promise<any> {
    const response = await apiClient.get('/roles', { params });
    return response.data.data || response.data;
  },

  /**
   * Obtener un rol por ID
   */
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Crear un nuevo rol
   */
  async create(data: IRolesStore.RoleInput): Promise<any> {
    const response = await apiClient.post('/roles', data);
    return response.data.data || response.data;
  },

  /**
   * Actualizar un rol existente
   */
  async update(id: string, data: IRolesStore.RoleUpdateInput): Promise<any> {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Eliminar un rol
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
};

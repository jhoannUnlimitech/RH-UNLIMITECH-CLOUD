import apiClient from '../client';

export interface Permission {
  _id: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export const permissionsService = {
  /**
   * Obtener todos los permisos
   */
  async getAll(): Promise<Permission[]> {
    const response = await apiClient.get('/permissions');
    // El interceptor ya extrae response.data.data, así que solo necesitamos response.data
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Obtener un permiso por ID
   */
  async getById(id: string): Promise<Permission> {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data;
  },
};

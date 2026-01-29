import apiClient from '../client';
import { IDivisionsStore } from '../../stores/views/DivisionsStore.contract';

export const divisionsService = {
  /**
   * Obtener todas las divisiones
   */
  async getAll(): Promise<IDivisionsStore.Division[]> {
    const response = await apiClient.get<{ success: boolean; data: IDivisionsStore.Division[] }>('/divisions');
    return response.data.data;
  },

  /**
   * Obtener una división por ID
   */
  async getById(id: string): Promise<IDivisionsStore.Division> {
    const response = await apiClient.get<{ success: boolean; data: { division: IDivisionsStore.Division; employeeCount: number; employees: any[] } }>(`/divisions/${id}`);
    return response.data.data.division;
  },

  /**
   * Crear una nueva división
   */
  async create(data: IDivisionsStore.DivisionInput): Promise<IDivisionsStore.Division> {
    const response = await apiClient.post<{ success: boolean; data: IDivisionsStore.Division }>('/divisions', data);
    return response.data.data;
  },

  /**
   * Actualizar una división existente
   */
  async update(
    id: string,
    data: IDivisionsStore.DivisionInput
  ): Promise<IDivisionsStore.Division> {
    const response = await apiClient.put<{ success: boolean; data: IDivisionsStore.Division }>(`/divisions/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar una división
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/divisions/${id}`);
  },
};

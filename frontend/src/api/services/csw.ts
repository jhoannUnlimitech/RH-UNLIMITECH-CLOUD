import apiClient from '../client';
import { ICSWStore } from '../../stores/views/CSWStore.contract';

class CSWService {
  private readonly baseURL = '/csw';

  /**
   * Obtener todas las solicitudes CSW
   */
  async getAll(): Promise<ICSWStore.CSW[]> {
    const response = await apiClient.get<{ success: boolean; data: ICSWStore.CSW[] }>(this.baseURL);
    return response.data.data;
  }

  /**
   * Obtener una solicitud CSW por ID
   */
  async getById(id: string): Promise<ICSWStore.CSW> {
    const response = await apiClient.get<{ success: boolean; data: ICSWStore.CSW }>(`${this.baseURL}/${id}`);
    return response.data.data;
  }

  /**
   * Crear una nueva solicitud CSW
   */
  async create(data: ICSWStore.CSWInput): Promise<ICSWStore.CSW> {
    const response = await apiClient.post<{ success: boolean; data: ICSWStore.CSW }>(this.baseURL, data);
    return response.data.data;
  }

  /**
   * Actualizar una solicitud CSW
   */
  async update(id: string, data: ICSWStore.CSWInput): Promise<ICSWStore.CSW> {
    const response = await apiClient.put<{ success: boolean; data: ICSWStore.CSW }>(`${this.baseURL}/${id}`, data);
    return response.data.data;
  }

  /**
   * Eliminar una solicitud CSW (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Aprobar una solicitud en un nivel específico
   */
  async approve(id: string, level: number, comments?: string): Promise<ICSWStore.CSW> {
    const response = await apiClient.post<{ success: boolean; data: ICSWStore.CSW }>(
      `${this.baseURL}/${id}/approve`,
      { level, comments }
    );
    return response.data.data;
  }

  /**
   * Rechazar una solicitud en un nivel específico
   */
  async reject(id: string, level: number, comments: string): Promise<ICSWStore.CSW> {
    const response = await apiClient.post<{ success: boolean; data: ICSWStore.CSW }>(
      `${this.baseURL}/${id}/reject`,
      { level, comments }
    );
    return response.data.data;
  }

  /**
   * Cancelar una solicitud
   */
  async cancel(id: string, comments?: string): Promise<ICSWStore.CSW> {
    const response = await apiClient.post<{ success: boolean; data: ICSWStore.CSW }>(
      `${this.baseURL}/${id}/cancel`,
      { comments }
    );
    return response.data.data;
  }
}

export const cswService = new CSWService();

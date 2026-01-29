import apiClient from '../client';
import { IAuthStore } from '../../stores/views/AuthStore.contract';

export const authService = {
  /**
   * Login - Autentica un usuario
   */
  async login(
    email: string,
    password: string
  ): Promise<IAuthStore.LoginResponse> {
    const response = await apiClient.post<{
      status: string;
      message: string;
      data: {
        employee: any;
        session: any;
        debug?: { token: string };
      };
    }>('/auth/login', { email, password });
    
    const employee = response.data.data.employee;
    
    // Mapear la respuesta del backend al formato esperado
    return {
      token: response.data.data.debug?.token || '', // En producción, el token está en cookie
      user: {
        _id: employee.id,
        email: employee.email,
        name: employee.name,
        position: employee.position || '',
        division: {
          _id: employee.division?.id || '',
          name: employee.division?.name || employee.division || ''
        },
        role: {
          _id: employee.role?.id || '',
          name: employee.role?.name || employee.role || '',
          permissions: employee.permissions || []
        },
        photo: employee.photo
      }
    };
  },

  /**
   * Logout - Cierra sesión
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Check Auth - Verifica el token actual
   */
  async checkAuth(): Promise<IAuthStore.User> {
    const response = await apiClient.get<{ 
      status: string; 
      data: { 
        employee: any 
      } 
    }>('/auth/me');
    
    const employee = response.data.data.employee;
    
    // Mapear la respuesta del backend al formato esperado por el contrato
    return {
      _id: employee.id, // El backend usa 'id', el frontend usa '_id'
      email: employee.email,
      name: employee.name,
      position: employee.position || '',
      division: {
        _id: employee.division?.id || '',
        name: employee.division?.name || employee.division || ''
      },
      role: {
        _id: employee.role?.id || '',
        name: employee.role?.name || employee.role || '',
        permissions: employee.role?.permissions || []
      },
      photo: employee.photo
    };
  },
};

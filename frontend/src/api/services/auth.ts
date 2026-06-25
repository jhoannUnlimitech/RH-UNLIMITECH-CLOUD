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
    
    return {
      token: response.data.data.debug?.token || '',
      user: {
        _id: employee.id,
        email: employee.email,
        name: employee.name,
        position: employee.position || '',
        division: {
          _id: employee.division?.id || employee.division?._id || '',
          name: employee.division?.name || ''
        },
        role: {
          _id: employee.role?.id || employee.role?._id || '',
          name: employee.role?.name || '',
          permissions: employee.role?.permissions || []
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
    
    return {
      _id: employee.id,
      email: employee.email,
      name: employee.name,
      position: employee.position || '',
      division: {
        _id: employee.division?.id || employee.division?._id || '',
        name: employee.division?.name || '',
      },
      role: {
        _id: employee.role?.id || employee.role?._id || '',
        name: employee.role?.name || '',
        permissions: employee.role?.permissions || []
      },
      photo: employee.photo
    };
  },
};

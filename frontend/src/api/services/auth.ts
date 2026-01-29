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
    const response = await apiClient.post<IAuthStore.LoginResponse>(
      '/auth/login',
      { email, password }
    );
    return response.data;
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
    const response = await apiClient.get<IAuthStore.User>('/auth/me');
    return response.data;
  },
};

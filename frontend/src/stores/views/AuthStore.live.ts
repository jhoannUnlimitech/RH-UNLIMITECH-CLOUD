import { makeAutoObservable, runInAction } from 'mobx';
import { IAuthStore } from './AuthStore.contract';
import { authService } from '../../api/services/auth';

/**
 * AuthStore Live Implementation
 * Implementación que conecta con la API real
 */
export class AuthStoreLive implements IAuthStore {
  user: IAuthStore.User | null = null;
  token: string | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async login(email: string, password: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await authService.login(email, password);
      
      runInAction(() => {
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
      });
      
      // Guardar en localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (err) {
      // Ignorar errores al cerrar sesión
      console.error('Error al cerrar sesión:', err);
    } finally {
      runInAction(() => {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
      });
      
      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  async checkAuth(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
    });
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Verificar token con backend
        const user = await authService.checkAuth();
        
        runInAction(() => {
          this.token = token;
          this.user = user;
          this.isAuthenticated = true;
        });
        
        // Actualizar localStorage
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    } catch (err) {
      // Token inválido o expirado
      await this.logout();
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  clearError(): void {
    this.error = null;
  }

  get userRole(): string | null {
    return this.user?.role?.name || null;
  }

  get userName(): string | null {
    return this.user?.name || null;
  }
}

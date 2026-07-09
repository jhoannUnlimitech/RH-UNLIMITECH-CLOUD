import { makeAutoObservable, runInAction } from 'mobx';
import { IAuthStore } from './AuthStore.contract';
import { authService } from '../../api/services/auth';
import { notify } from '../../utils/toast';

/**
 * AuthStore Live Implementation
 * Implementación que conecta con la API real
 */
export class AuthStoreLive implements IAuthStore {
  user: IAuthStore.User | null = null;
  token: string | null = null;
  isAuthenticated = false;
  isLoading = true; // Inicia en true para evitar flash de redirect antes de checkAuth
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
      
      notify.success(`Bienvenido, ${response.user.name}`);
      
      // Cache user data para fallback (NO el token — solo la cookie lo maneja)
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';
      });
      notify.error(err.response?.data?.message || 'Error al iniciar sesión');
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
      console.error('Error al cerrar sesión:', err);
    } finally {
      runInAction(() => {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
      });
      
      localStorage.removeItem('auth_user');
    }
  }

  async checkAuth(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
    });
    
    try {
      // Cookie-first: el backend lee la cookie httpOnly directamente
      const user = await authService.checkAuth();
      
      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
      });
      
      // Actualizar cache local
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (err) {
      // Si falla la verificación, intentar cache como fallback
      const cachedUser = localStorage.getItem('auth_user');
      
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          runInAction(() => {
            this.user = user;
            this.isAuthenticated = true;
          });
        } catch {
          await this.logout();
        }
      } else {
        runInAction(() => {
          this.user = null;
          this.token = null;
          this.isAuthenticated = false;
        });
      }
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

import { makeAutoObservable } from 'mobx';
import { IAuthStore } from './AuthStore.contract';

/**
 * AuthStore Mock Implementation
 * Implementación con datos de ejemplo para desarrollo
 */
export class AuthStoreMock implements IAuthStore {
  user: IAuthStore.User | null = null;
  token: string | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Datos de ejemplo para admin@rh.com
      if (email === 'admin@rh.com' && password === 'admin123') {
        this.user = {
          _id: '1',
          email: 'admin@rh.com',
          name: 'Jordan Blake',
          position: 'CEO',
          division: {
            _id: '10',
            name: 'RRHH',
          },
          role: {
            _id: '1',
            name: 'CEO',
            permissions: [
              { resource: 'employees', action: 'read' },
              { resource: 'employees', action: 'create' },
              { resource: 'employees', action: 'update' },
              { resource: 'employees', action: 'delete' },
            ],
          },
        };
        this.token = 'mock-jwt-token-12345';
        this.isAuthenticated = true;
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Error al iniciar sesión';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    this.user = null;
    this.token = null;
    this.isAuthenticated = false;
    
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async checkAuth(): Promise<void> {
    this.isLoading = true;
    
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
      }
    } catch (err) {
      this.logout();
    } finally {
      this.isLoading = false;
    }
  }

  clearError(): void {
    this.error = null;
  }

  get userRole(): string | null {
    return this.user?.role.name || null;
  }

  get userName(): string | null {
    return this.user?.name || null;
  }
}

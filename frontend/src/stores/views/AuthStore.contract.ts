/**
 * AuthStore Contract
 * Define la interfaz y tipos para el store de autenticación
 */

export interface IAuthStore {
  // State
  user: IAuthStore.User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  checkAuth(): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  clearError(): void;

  // Computed
  get userRole(): string | null;
  get userName(): string | null;
}

export namespace IAuthStore {
  export interface User {
    _id: string;
    email: string;
    name: string;
    position: string;
    division: {
      _id: string;
      name: string;
    };
    role: {
      _id: string;
      name: string;
      permissions: Permission[];
    };
    photo?: string;
    approve_csw?: boolean;
    forcePasswordChange?: boolean;
    phone?: string;
    nationalId?: string;
    nationality?: string;
    birthDate?: string;
  }

  export interface Permission {
    resource: string;
    action: string;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    token: string;
    user: User;
  }
}

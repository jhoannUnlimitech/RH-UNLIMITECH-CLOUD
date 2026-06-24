/**
 * HatsStore Contract
 * Define la interfaz y tipos para el store de hats
 */

export interface IHatsStore {
  // State
  roles: IHatsStore.Role[];
  selectedHat: IHatsStore.Role | null;
  isLoading: boolean;
  error: string | null;
  pagination: IHatsStore.Pagination | null;

  // Actions
  fetchHats(params?: IHatsStore.FetchParams): Promise<void>;
  fetchHatById(id: string): Promise<void>;
  createHat(data: IHatsStore.RoleInput): Promise<void>;
  updateHat(id: string, data: IHatsStore.RoleUpdateInput): Promise<void>;
  deleteHat(id: string): Promise<void>;
  clearError(): void;
  setSelectedHat(role: IHatsStore.Role | null): void;
}

export namespace IHatsStore {
  export interface Role {
    _id: string;
    name: string;
    permissions: Permission[];
    employeesCount?: number;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface Permission {
    _id: string;
    resource: string;
    action: string;
  }

  export interface RoleInput {
    name: string;
    permissions: string[];
  }

  export interface RoleUpdateInput {
    name?: string;
    permissions?: string[];
  }

  export interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
  }

  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
}

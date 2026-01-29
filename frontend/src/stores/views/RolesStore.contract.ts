/**
 * RolesStore Contract
 * Define la interfaz y tipos para el store de roles
 */

export interface IRolesStore {
  // State
  roles: IRolesStore.Role[];
  selectedRole: IRolesStore.Role | null;
  isLoading: boolean;
  error: string | null;
  pagination: IRolesStore.Pagination | null;

  // Actions
  fetchRoles(params?: IRolesStore.FetchParams): Promise<void>;
  fetchRoleById(id: string): Promise<void>;
  createRole(data: IRolesStore.RoleInput): Promise<void>;
  updateRole(id: string, data: IRolesStore.RoleUpdateInput): Promise<void>;
  deleteRole(id: string): Promise<void>;
  clearError(): void;
  setSelectedRole(role: IRolesStore.Role | null): void;
}

export namespace IRolesStore {
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

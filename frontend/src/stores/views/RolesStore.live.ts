import { makeAutoObservable, runInAction } from "mobx";
import { IRolesStore } from "./RolesStore.contract";
import { rolesService } from "../../api/services/roles";

export class RolesStoreLive implements IRolesStore {
  roles: IRolesStore.Role[] = [];
  selectedRole: IRolesStore.Role | null = null;
  isLoading = false;
  error: string | null = null;
  pagination: IRolesStore.Pagination | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchRoles(params?: IRolesStore.FetchParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await rolesService.getAll(params);
      runInAction(() => {
        this.roles = response.data || response;
        this.pagination = response.pagination || null;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al cargar los roles";
        this.isLoading = false;
      });
    }
  }

  async fetchRoleById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await rolesService.getById(id);
      runInAction(() => {
        this.selectedRole = response.data?.role || response;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al cargar el rol";
        this.isLoading = false;
      });
    }
  }

  async createRole(data: IRolesStore.RoleInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await rolesService.create(data);
      runInAction(() => {
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al crear el rol";
        this.isLoading = false;
      });
      throw error;
    }
  }

  async updateRole(id: string, data: IRolesStore.RoleUpdateInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await rolesService.update(id, data);
      runInAction(() => {
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al actualizar el rol";
        this.isLoading = false;
      });
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await rolesService.delete(id);
      runInAction(() => {
        this.roles = this.roles.filter(role => role._id !== id);
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al eliminar el rol";
        this.isLoading = false;
      });
      throw error;
    }
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedRole(role: IRolesStore.Role | null): void {
    this.selectedRole = role;
  }
}

export const rolesStore = new RolesStoreLive();

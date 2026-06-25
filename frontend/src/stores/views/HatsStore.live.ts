import { makeAutoObservable, runInAction } from "mobx";
import { IHatsStore } from "./HatsStore.contract";
import { hatsService } from "../../api/services/hats";
import { notify } from "../../utils/toast";

export class HatsStoreLive implements IHatsStore {
  roles: IHatsStore.Role[] = [];
  selectedHat: IHatsStore.Role | null = null;
  isLoading = false;
  error: string | null = null;
  pagination: IHatsStore.Pagination | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchHats(params?: IHatsStore.FetchParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await hatsService.getAll(params);
      runInAction(() => {
        this.roles = response.data || response;
        this.pagination = response.pagination || null;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al cargar los hats";
        this.isLoading = false;
      });
    }
  }

  async fetchHatById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await hatsService.getById(id);
      runInAction(() => {
        const data = response.data || response;
        const role = data.role || data;
        // Adjuntar employees al role object para la vista
        if (data.employees) {
          role.employees = data.employees;
          role.employeesCount = data.employeesCount || data.employees.length;
        }
        this.selectedHat = role;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al cargar el hat";
        this.isLoading = false;
      });
    }
  }

  async createHat(data: IHatsStore.RoleInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await hatsService.create(data);
      runInAction(() => {
        this.isLoading = false;
      });
      notify.success("Hat creado exitosamente");
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al crear el hat";
        this.isLoading = false;
      });
      notify.error(error.response?.data?.message || "Error al crear el hat");
      throw error;
    }
  }

  async updateHat(id: string, data: IHatsStore.RoleUpdateInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await hatsService.update(id, data);
      runInAction(() => {
        this.isLoading = false;
      });
      notify.success("Hat actualizado exitosamente");
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al actualizar el hat";
        this.isLoading = false;
      });
      notify.error(error.response?.data?.message || "Error al actualizar el hat");
      throw error;
    }
  }

  async deleteHat(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await hatsService.delete(id);
      runInAction(() => {
        this.roles = this.roles.filter(role => role._id !== id);
        this.isLoading = false;
      });
      notify.success("Hat eliminado exitosamente");
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Error al eliminar el hat";
        this.isLoading = false;
      });
      notify.error(error.response?.data?.message || "Error al eliminar el hat");
      throw error;
    }
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedHat(role: IHatsStore.Role | null): void {
    this.selectedHat = role;
  }
}

export const hatsStore = new HatsStoreLive();

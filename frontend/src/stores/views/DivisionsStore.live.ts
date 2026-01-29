import { makeAutoObservable, runInAction } from 'mobx';
import { IDivisionsStore } from './DivisionsStore.contract';
import { divisionsService } from '../../api/services/divisions';

/**
 * DivisionsStore Live Implementation
 * Implementación que conecta con la API real
 */
export class DivisionsStoreLive implements IDivisionsStore {
  divisions: IDivisionsStore.Division[] = [];
  selectedDivision: IDivisionsStore.Division | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchDivisions(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const divisions = await divisionsService.getAll();
      runInAction(() => {
        this.divisions = divisions;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar divisiones';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchDivisionById(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const division = await divisionsService.getById(id);
      runInAction(() => {
        this.selectedDivision = division;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar división';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createDivision(data: IDivisionsStore.DivisionInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const newDivision = await divisionsService.create(data);
      runInAction(() => {
        this.divisions.push(newDivision);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al crear división';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateDivision(
    id: string,
    data: IDivisionsStore.DivisionInput
  ): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedDivision = await divisionsService.update(id, data);
      runInAction(() => {
        const index = this.divisions.findIndex((d) => d._id === id);
        if (index !== -1) {
          this.divisions[index] = updatedDivision;
        }
      });
    } catch (err: any) {
      runInAction(() => {
        this.error =
          err.response?.data?.message || 'Error al actualizar división';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteDivision(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await divisionsService.delete(id);
      runInAction(() => {
        this.divisions = this.divisions.filter((d) => d._id !== id);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al eliminar división';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedDivision(division: IDivisionsStore.Division | null): void {
    this.selectedDivision = division;
  }
}

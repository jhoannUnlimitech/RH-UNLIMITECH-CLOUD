import { makeAutoObservable } from 'mobx';
import { IDivisionsStore } from './DivisionsStore.contract';

/**
 * DivisionsStore Mock Implementation
 * Implementación con datos de ejemplo para desarrollo
 */
export class DivisionsStoreMock implements IDivisionsStore {
  divisions: IDivisionsStore.Division[] = [
    {
      _id: '1',
      name: 'Tecnología',
      code: 'TEC',
      description: 'División de Tecnología e Innovación',
      managerId: 'emp1',
      manager: {
        _id: 'emp1',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        photo: undefined,
      },
      status: 'active',
      deleted: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: '2',
      name: 'Recursos Humanos',
      code: 'RRHH',
      description: 'División de Gestión de Personas',
      managerId: 'emp2',
      manager: {
        _id: 'emp2',
        name: 'María García',
        email: 'maria.garcia@example.com',
        photo: undefined,
      },
      status: 'active',
      deleted: false,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
    },
    {
      _id: '3',
      name: 'Finanzas',
      code: 'FIN',
      description: 'División Financiera',
      managerId: 'emp3',
      manager: {
        _id: 'emp3',
        name: 'Carlos López',
        email: 'carlos.lopez@example.com',
        photo: undefined,
      },
      status: 'active',
      deleted: false,
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-05T10:00:00Z',
    },
  ];

  selectedDivision: IDivisionsStore.Division | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchDivisions(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Los datos ya están en this.divisions
    } catch (err: any) {
      this.error = 'Error al cargar divisiones';
    } finally {
      this.isLoading = false;
    }
  }

  async fetchDivisionById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const division = this.divisions.find((d) => d._id === id);
      if (division) {
        this.selectedDivision = division;
      } else {
        this.error = 'División no encontrada';
      }
    } catch (err: any) {
      this.error = 'Error al cargar división';
    } finally {
      this.isLoading = false;
    }
  }

  async createDivision(
    data: IDivisionsStore.DivisionInput
  ): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newDivision: IDivisionsStore.Division = {
        _id: String(Date.now()),
        name: data.name,
        code: data.code,
        description: data.description,
        managerId: data.managerId,
        status: data.status || 'active',
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.divisions.push(newDivision);
    } catch (err: any) {
      this.error = 'Error al crear división';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async updateDivision(
    id: string,
    data: IDivisionsStore.DivisionInput
  ): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = this.divisions.findIndex((d) => d._id === id);
      if (index !== -1) {
        this.divisions[index] = {
          ...this.divisions[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
      } else {
        throw new Error('División no encontrada');
      }
    } catch (err: any) {
      this.error = 'Error al actualizar división';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async deleteDivision(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.divisions = this.divisions.filter((d) => d._id !== id);
    } catch (err: any) {
      this.error = 'Error al eliminar división';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedDivision(division: IDivisionsStore.Division | null): void {
    this.selectedDivision = division;
  }
}

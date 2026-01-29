import { makeAutoObservable, runInAction } from 'mobx';
import { IEmployeesStore } from './EmployeesStore.contract';
import { employeesService } from '../../api/services/employees';

/**
 * EmployeesStore Live Implementation
 * Implementación que conecta con la API real
 */
export class EmployeesStoreLive implements IEmployeesStore {
  employees: IEmployeesStore.Employee[] = [];
  selectedEmployee: IEmployeesStore.Employee | null = null;
  isLoading = false;
  error: string | null = null;
  pagination: IEmployeesStore.Pagination | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchEmployees(params?: IEmployeesStore.FetchParams): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await employeesService.getAll(params);
      runInAction(() => {
        this.employees = response.data;
        this.pagination = response.pagination || null;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar empleados';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchEmployeeById(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const employee = await employeesService.getById(id);
      runInAction(() => {
        this.selectedEmployee = employee;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar empleado';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createEmployee(data: IEmployeesStore.EmployeeInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const newEmployee = await employeesService.create(data);
      runInAction(() => {
        this.employees.push(newEmployee);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al crear empleado';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateEmployee(
    id: string,
    data: IEmployeesStore.EmployeeUpdateInput
  ): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedEmployee = await employeesService.update(id, data);
      runInAction(() => {
        const index = this.employees.findIndex((e) => e._id === id);
        if (index !== -1) {
          this.employees[index] = updatedEmployee;
        }
      });
    } catch (err: any) {
      runInAction(() => {
        this.error =
          err.response?.data?.message || 'Error al actualizar empleado';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await employeesService.delete(id);
      runInAction(() => {
        this.employees = this.employees.filter((e) => e._id !== id);
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al eliminar empleado';
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

  setSelectedEmployee(employee: IEmployeesStore.Employee | null): void {
    this.selectedEmployee = employee;
  }
}

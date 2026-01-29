/**
 * EmployeesStore Contract
 * Define la interfaz y tipos para el store de empleados
 */

export interface IEmployeesStore {
  // State
  employees: IEmployeesStore.Employee[];
  selectedEmployee: IEmployeesStore.Employee | null;
  isLoading: boolean;
  error: string | null;
  pagination: IEmployeesStore.Pagination | null;

  // Actions
  fetchEmployees(params?: IEmployeesStore.FetchParams): Promise<void>;
  fetchEmployeeById(id: string): Promise<void>;
  createEmployee(data: IEmployeesStore.EmployeeInput): Promise<void>;
  updateEmployee(id: string, data: IEmployeesStore.EmployeeUpdateInput): Promise<void>;
  deleteEmployee(id: string): Promise<void>;
  clearError(): void;
  setSelectedEmployee(employee: IEmployeesStore.Employee | null): void;
}

export namespace IEmployeesStore {
  export interface Employee {
    _id: string;
    name: string;
    email: string;
    phone: string;
    photo?: string;
    role: {
      _id: string;
      name: string;
      permissions?: string[];
    };
    division: {
      _id: string;
      name: string;
      description?: string;
    };
    birthDate: string;
    nationalId: string;
    nationality: string;
    managerId?: string;
    manager?: {
      _id: string;
      name: string;
      email: string;
      photo?: string;
    };
    techLeadId?: string;
    techLead?: {
      _id: string;
      name: string;
      email: string;
      photo?: string;
    };
    forcePasswordChange: boolean;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface EmployeeInput {
    name: string;
    email: string;
    password: string;
    phone: string;
    photo?: string;
    role: string;
    division: string;
    birthDate: string;
    nationalId: string;
    nationality: string;
    managerId?: string;
    techLeadId?: string;
    forcePasswordChange?: boolean;
  }

  export interface EmployeeUpdateInput {
    name?: string;
    eassword?: string;
    phone?: string;
    photo?: string;
    role?: string;
    division?: string;
    birthDate?: string;
    nationalId?: string;
    nationality?: string;
    managerId?: string;
    techLeadId?: string;
    forcePasswordChange?: boolean
    techLeadId?: string;
  }

  export interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    division?: string;
  }

  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
}

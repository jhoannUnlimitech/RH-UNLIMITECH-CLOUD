import { makeAutoObservable } from 'mobx';
import { IEmployeesStore } from './EmployeesStore.contract';

/**
 * EmployeesStore Mock Implementation
 * Implementación con datos de ejemplo para desarrollo
 */
export class EmployeesStoreMock implements IEmployeesStore {
  employees: IEmployeesStore.Employee[] = [
    {
      _id: 'emp1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+58 412-1234567',
      photo: undefined,
      role: {
        _id: 'role1',
        name: 'Tech Lead',
        permissions: ['employees:read', 'divisions:read'],
      },
      division: {
        _id: 'div1',
        name: 'Tecnología',
        description: 'División de Tecnología e Innovación',
      },
      birthDate: '1990-05-15',
      nationalId: 'V-12345678',
      nationality: 'Venezolano',
      managerId: undefined,
      manager: undefined,
      techLeadId: undefined,
      techLead: undefined,
      deleted: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: 'emp2',
      name: 'María García',
      email: 'maria.garcia@example.com',
      phone: '+58 424-9876543',
      photo: undefined,
      role: {
        _id: 'role2',
        name: 'HR Manager',
        permissions: ['employees:read', 'employees:create', 'employees:update'],
      },
      division: {
        _id: 'div2',
        name: 'Recursos Humanos',
        description: 'División de Gestión de Personas',
      },
      birthDate: '1988-08-20',
      nationalId: 'V-23456789',
      nationality: 'Venezolana',
      managerId: 'emp1',
      manager: {
        _id: 'emp1',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        photo: undefined,
      },
      techLeadId: undefined,
      techLead: undefined,
      deleted: false,
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
    },
    {
      _id: 'emp3',
      name: 'Carlos López',
      email: 'carlos.lopez@example.com',
      phone: '+58 414-5555555',
      photo: undefined,
      role: {
        _id: 'role3',
        name: 'Financial Analyst',
        permissions: ['employees:read'],
      },
      division: {
        _id: 'div3',
        name: 'Finanzas',
        description: 'División Financiera',
      },
      birthDate: '1992-12-10',
      nationalId: 'V-34567890',
      nationality: 'Venezolano',
      managerId: 'emp2',
      manager: {
        _id: 'emp2',
        name: 'María García',
        email: 'maria.garcia@example.com',
        photo: undefined,
      },
      techLeadId: 'emp1',
      techLead: {
        _id: 'emp1',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        photo: undefined,
      },
      deleted: false,
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-05T10:00:00Z',
    },
  ];

  selectedEmployee: IEmployeesStore.Employee | null = null;
  isLoading = false;
  error: string | null = null;
  pagination: IEmployeesStore.Pagination | null = {
    page: 1,
    limit: 10,
    total: 3,
    pages: 1,
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchEmployees(params?: IEmployeesStore.FetchParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Aplicar filtros básicos si existen
      let filtered = [...this.employees];
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(
          (emp) =>
            emp.name.toLowerCase().includes(searchLower) ||
            emp.email.toLowerCase().includes(searchLower) ||
            emp.nationalId.toLowerCase().includes(searchLower)
        );
      }
      if (params?.role) {
        filtered = filtered.filter((emp) => emp.role._id === params.role);
      }
      if (params?.division) {
        filtered = filtered.filter((emp) => emp.division._id === params.division);
      }

      this.employees = filtered;
      this.pagination = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: filtered.length,
        pages: Math.ceil(filtered.length / (params?.limit || 10)),
      };
    } catch (err: any) {
      this.error = 'Error al cargar empleados';
    } finally {
      this.isLoading = false;
    }
  }

  async fetchEmployeeById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const employee = this.employees.find((e) => e._id === id);
      if (employee) {
        this.selectedEmployee = employee;
      } else {
        this.error = 'Empleado no encontrado';
      }
    } catch (err: any) {
      this.error = 'Error al cargar empleado';
    } finally {
      this.isLoading = false;
    }
  }

  async createEmployee(data: IEmployeesStore.EmployeeInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newEmployee: IEmployeesStore.Employee = {
        _id: `emp${this.employees.length + 1}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
        role: {
          _id: data.role,
          name: 'Mock Role',
        },
        division: {
          _id: data.division,
          name: 'Mock Division',
        },
        birthDate: data.birthDate,
        nationalId: data.nationalId,
        nationality: data.nationality,
        managerId: data.managerId,
        manager: data.managerId
          ? {
              _id: data.managerId,
              name: 'Mock Manager',
              email: 'manager@example.com',
            }
          : undefined,
        techLeadId: data.techLeadId,
        techLead: data.techLeadId
          ? {
              _id: data.techLeadId,
              name: 'Mock Tech Lead',
              email: 'techlead@example.com',
            }
          : undefined,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.employees.push(newEmployee);
    } catch (err: any) {
      this.error = 'Error al crear empleado';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async updateEmployee(
    id: string,
    data: IEmployeesStore.EmployeeUpdateInput
  ): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.employees.findIndex((e) => e._id === id);
      if (index !== -1) {
        this.employees[index] = {
          ...this.employees[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
      } else {
        this.error = 'Empleado no encontrado';
        throw new Error('Empleado no encontrado');
      }
    } catch (err: any) {
      this.error = 'Error al actualizar empleado';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.employees = this.employees.filter((e) => e._id !== id);
    } catch (err: any) {
      this.error = 'Error al eliminar empleado';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedEmployee(employee: IEmployeesStore.Employee | null): void {
    this.selectedEmployee = employee;
  }
}

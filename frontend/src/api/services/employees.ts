import apiClient from '../client';

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
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
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
}

export interface UpdateEmployeeInput {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  role?: string;
  division?: string;
  birthDate?: string;
  nationalId?: string;
  nationality?: string;
  managerId?: string;
  techLeadId?: string;
}

export const employeesService = {
  /**
   * Obtener todos los empleados con paginación y filtros
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    division?: string;
  }): Promise<{ data: Employee[]; pagination?: { page: number; limit: number; total: number; pages: number } }> {
    const response = await apiClient.get('/employees', { params });
    
    // Si la respuesta tiene estructura { success, data, pagination }
    if (response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    }
    
    // Si la respuesta es un array directo
    return { data: Array.isArray(response.data) ? response.data : [] };
  },

  /**
   * Obtener un empleado por ID
   */
  async getById(id: string): Promise<Employee> {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Crear nuevo empleado
   */
  async create(data: CreateEmployeeInput): Promise<Employee> {
    const response = await apiClient.post('/employees', data);
    return response.data.data || response.data;
  },

  /**
   * Actualizar empleado
   */
  async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Eliminar empleado (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },
};

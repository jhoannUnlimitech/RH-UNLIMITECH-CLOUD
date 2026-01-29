import { makeAutoObservable } from 'mobx';
import { IRolesStore } from './RolesStore.contract';

/**
 * RolesStore Mock Implementation
 * Store con datos de ejemplo para desarrollo y prototipado
 */
export class RolesStoreMock implements IRolesStore {
  roles: IRolesStore.Role[] = [
    {
      _id: '1',
      name: 'ARCHITECT SOLUTIONS',
      permissions: [
        { _id: '1', resource: 'employees', action: 'read' },
        { _id: '2', resource: 'employees', action: 'create' },
        { _id: '3', resource: 'employees', action: 'update' },
        { _id: '4', resource: 'employees', action: 'delete' },
        { _id: '5', resource: 'divisions', action: 'read' },
        { _id: '6', resource: 'divisions', action: 'create' },
        { _id: '7', resource: 'divisions', action: 'update' },
        { _id: '8', resource: 'divisions', action: 'delete' },
        { _id: '9', resource: 'roles', action: 'read' },
        { _id: '10', resource: 'roles', action: 'create' },
        { _id: '11', resource: 'roles', action: 'update' },
        { _id: '12', resource: 'roles', action: 'delete' },
      ],
      employeesCount: 2,
      deleted: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: '2',
      name: 'AI DRIVEN DEVELOPER',
      permissions: [
        { _id: '1', resource: 'employees', action: 'read' },
        { _id: '5', resource: 'divisions', action: 'read' },
        { _id: '9', resource: 'roles', action: 'read' },
      ],
      employeesCount: 5,
      deleted: false,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      _id: '3',
      name: 'HUMAN TALENT',
      permissions: [
        { _id: '1', resource: 'employees', action: 'read' },
        { _id: '2', resource: 'employees', action: 'create' },
        { _id: '3', resource: 'employees', action: 'update' },
        { _id: '5', resource: 'divisions', action: 'read' },
        { _id: '9', resource: 'roles', action: 'read' },
      ],
      employeesCount: 3,
      deleted: false,
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
    },
  ];

  selectedRole: IRolesStore.Role | null = null;
  isLoading = false;
  error: string | null = null;
  pagination: IRolesStore.Pagination = {
    page: 1,
    limit: 10,
    total: 3,
    pages: 1,
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchRoles(_params?: IRolesStore.FetchParams): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    this.isLoading = false;
    // Los datos ya están en this.roles
  }

  async fetchRoleById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const role = this.roles.find(r => r._id === id);
    if (role) {
      this.selectedRole = role;
    } else {
      this.error = 'Rol no encontrado';
    }

    this.isLoading = false;
  }

  async createRole(data: IRolesStore.RoleInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));

    const newRole: IRolesStore.Role = {
      _id: `mock-${Date.now()}`,
      name: data.name,
      permissions: data.permissions.map((permId) => ({
        _id: permId,
        resource: 'mock',
        action: 'read',
      })),
      employeesCount: 0,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.roles.push(newRole);
    this.isLoading = false;
  }

  async updateRole(id: string, data: IRolesStore.RoleUpdateInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));

    const roleIndex = this.roles.findIndex(r => r._id === id);
    if (roleIndex !== -1) {
      if (data.name) {
        this.roles[roleIndex].name = data.name;
      }
      if (data.permissions) {
        this.roles[roleIndex].permissions = data.permissions.map(permId => ({
          _id: permId,
          resource: 'mock',
          action: 'read',
        }));
      }
      this.roles[roleIndex].updatedAt = new Date().toISOString();
    } else {
      this.error = 'Rol no encontrado';
      throw new Error('Rol no encontrado');
    }

    this.isLoading = false;
  }

  async deleteRole(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    this.roles = this.roles.filter(role => role._id !== id);
    this.isLoading = false;
  }

  clearError(): void {
    this.error = null;
  }

  setSelectedRole(role: IRolesStore.Role | null): void {
    this.selectedRole = role;
  }
}

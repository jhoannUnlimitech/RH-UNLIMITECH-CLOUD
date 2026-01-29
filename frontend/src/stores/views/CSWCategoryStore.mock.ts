import { makeAutoObservable } from 'mobx';
import { ICSWCategoryStore } from './CSWCategoryStore.contract';

/**
 * CSWCategoryStore Mock Implementation
 * Store con datos de ejemplo para desarrollo y prototipado
 */
export class CSWCategoryStoreMock implements ICSWCategoryStore {
  categories: ICSWCategoryStore.Category[] = [
    {
      _id: '1',
      name: 'Permiso',
      description: 'Solicitudes de permisos laborales',
      active: true,
      order: 1,
      deleted: false,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      _id: '2',
      name: 'Vacaciones',
      description: 'Solicitudes de vacaciones',
      active: true,
      order: 2,
      deleted: false,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      _id: '3',
      name: 'Aumento',
      description: 'Solicitudes de aumento salarial',
      active: true,
      order: 3,
      deleted: false,
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
    },
    {
      _id: '4',
      name: 'Incapacidad',
      description: 'Solicitudes de incapacidad médica',
      active: true,
      order: 4,
      deleted: false,
      createdAt: '2024-01-18T10:00:00Z',
      updatedAt: '2024-01-18T10:00:00Z',
    },
    {
      _id: '5',
      name: 'Cambio de Puesto',
      description: 'Solicitudes de cambio de posición laboral',
      active: false,
      order: 5,
      deleted: false,
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-19T10:00:00Z',
    },
  ];

  selectedCategory: ICSWCategoryStore.Category | null = null;
  isLoading = false;
  isDeleting = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchCategories(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    this.isLoading = false;
    // Los datos ya están en this.categories
  }

  async fetchCategoryById(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const category = this.categories.find(c => c._id === id);
    if (category) {
      this.selectedCategory = category;
    } else {
      this.error = 'Categoría no encontrada';
    }

    this.isLoading = false;
  }

  async createCategory(input: ICSWCategoryStore.CategoryInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));

    const newCategory: ICSWCategoryStore.Category = {
      _id: `mock-${Date.now()}`,
      name: input.name,
      description: input.description,
      active: input.active ?? true,
      order: input.order ?? this.categories.length + 1,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.categories.push(newCategory);
    this.isLoading = false;
  }

  async updateCategory(id: string, input: ICSWCategoryStore.CategoryInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));

    const categoryIndex = this.categories.findIndex(c => c._id === id);
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        name: input.name,
        description: input.description,
        active: input.active ?? this.categories[categoryIndex].active,
        order: input.order ?? this.categories[categoryIndex].order,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.error = 'Categoría no encontrada';
      throw new Error('Categoría no encontrada');
    }

    this.isLoading = false;
  }

  async deleteCategory(id: string): Promise<void> {
    this.isDeleting = true;
    this.error = null;

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    this.categories = this.categories.filter(c => c._id !== id);
    this.isDeleting = false;
  }

  setSelectedCategory(category: ICSWCategoryStore.Category | null): void {
    this.selectedCategory = category;
  }

  clearError(): void {
    this.error = null;
  }
}

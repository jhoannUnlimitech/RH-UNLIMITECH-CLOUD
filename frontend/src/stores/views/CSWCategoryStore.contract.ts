// src/stores/views/CSWCategoryStore.contract.ts

/**
 * Interfaz para CSWCategoryStore
 * Define el contrato completo del store con observables, acciones y tipos
 */
export interface ICSWCategoryStore {
  // Observables
  readonly categories: ICSWCategoryStore.Category[];
  readonly selectedCategory: ICSWCategoryStore.Category | null;
  readonly isLoading: boolean;
  readonly isDeleting: boolean;
  readonly error: string | null;

  // Acciones
  fetchCategories(): Promise<void>;
  fetchCategoryById(id: string): Promise<void>;
  createCategory(input: ICSWCategoryStore.CategoryInput): Promise<void>;
  updateCategory(id: string, input: ICSWCategoryStore.CategoryInput): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  setSelectedCategory(category: ICSWCategoryStore.Category | null): void;
  clearError(): void;
}

/**
 * Namespace con tipos, DTOs y constantes
 */
export namespace ICSWCategoryStore {
  /**
   * Entidad Category completa
   */
  export interface Category {
    _id: string;
    name: string;
    description?: string;
    active: boolean;
    order: number;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }

  /**
   * DTO para crear/actualizar categorías
   */
  export interface CategoryInput {
    name: string;
    description?: string;
    active?: boolean;
  }

  /**
   * Estado de carga del store
   */
  export enum Status {
    Idle = 'idle',
    Loading = 'loading',
    Error = 'error',
    Success = 'success'
  }
}


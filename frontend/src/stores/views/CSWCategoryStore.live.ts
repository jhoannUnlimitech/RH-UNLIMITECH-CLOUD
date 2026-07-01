import { makeAutoObservable, runInAction } from 'mobx';
import { cswCategoryService } from '../../api/services/cswCategory';
import { ICSWCategoryStore } from './CSWCategoryStore.contract';
import { notify } from '../../utils/toast';

/**
 * CSWCategoryStore Live Implementation
 * Implementación que conecta con la API real
 */
export class CSWCategoryStoreLive implements ICSWCategoryStore {
  categories: ICSWCategoryStore.Category[] = [];
  selectedCategory: ICSWCategoryStore.Category | null = null;
  isLoading = false;
  isDeleting = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchCategories() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await cswCategoryService.getAll();
      runInAction(() => {
        this.categories = data;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al cargar las categorías';
        this.isLoading = false;
      });
    }
  }

  async fetchAllCategories() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await cswCategoryService.getAllIncludingInactive();
      runInAction(() => {
        this.categories = data;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al cargar las categorías';
        this.isLoading = false;
      });
    }
  }

  async fetchCategoryById(id: string) {
    try {
      const data = await cswCategoryService.getById(id);
      runInAction(() => {
        this.selectedCategory = data;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al cargar la categoría';
      });
    }
  }

  async createCategory(input: ICSWCategoryStore.CategoryInput) {
    try {
      const newCategory = await cswCategoryService.create(input);
      runInAction(() => {
        this.categories.push(newCategory);
      });
      notify.success('Categoría creada exitosamente');
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al crear la categoría';
      });
      notify.error(error.response?.data?.message || 'Error al crear la categoría');
      throw error;
    }
  }

  async updateCategory(id: string, input: ICSWCategoryStore.CategoryInput) {
    try {
      const updated = await cswCategoryService.update(id, input);
      runInAction(() => {
        const index = this.categories.findIndex(cat => cat._id === id);
        if (index !== -1) {
          this.categories[index] = updated;
        }
      });
      notify.success('Categoría actualizada exitosamente');
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al actualizar la categoría';
      });
      notify.error(error.response?.data?.message || 'Error al actualizar la categoría');
      throw error;
    }
  }

  async deleteCategory(id: string) {
    this.isDeleting = true;
    try {
      await cswCategoryService.delete(id);
      runInAction(() => {
        this.categories = this.categories.filter(cat => cat._id !== id);
        this.isDeleting = false;
      });
      notify.success('Categoría eliminada exitosamente');
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Error al eliminar la categoría';
        this.isDeleting = false;
      });
      notify.error(error.response?.data?.message || 'Error al eliminar la categoría');
      throw error;
    }
  }

  setSelectedCategory(category: ICSWCategoryStore.Category | null) {
    this.selectedCategory = category;
  }

  clearError() {
    this.error = null;
  }
}

export const cswCategoryStore = new CSWCategoryStoreLive();

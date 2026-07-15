import { makeAutoObservable, runInAction } from 'mobx';
import { trainingService, Course, Level, Badge } from '../../api/services/training';
import { notify } from '../../utils/toast';

/**
 * TrainingStore — Estado global de Cursos, Niveles e Insignias.
 */

class TrainingStore {
  courses: Course[] = [];
  levels: Level[] = [];
  badges: Badge[] = [];
  selectedBadge: Badge | null = null;
  selectedLevel: Level | null = null;
  selectedCourse: Course | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // --- Insignias ---

  async fetchBadges() {
    this.isLoading = true;
    try {
      const badges = await trainingService.getBadges();
      runInAction(() => { this.badges = badges; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar insignias'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async fetchBadgeById(id: string) {
    this.isLoading = true;
    try {
      const badge = await trainingService.getBadgeById(id);
      runInAction(() => { this.selectedBadge = badge; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createBadge(data: Partial<Badge>) {
    try {
      const badge = await trainingService.createBadge(data);
      runInAction(() => { this.badges.push(badge); });
      notify.success('Insignia creada exitosamente');
      return badge;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al crear insignia');
      throw err;
    }
  }

  async updateBadge(id: string, data: Partial<Badge>) {
    try {
      const updated = await trainingService.updateBadge(id, data);
      runInAction(() => {
        const idx = this.badges.findIndex(b => b._id === id);
        if (idx !== -1) this.badges[idx] = updated;
      });
      notify.success('Insignia actualizada');
      return updated;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al actualizar');
      throw err;
    }
  }

  async deleteBadge(id: string) {
    try {
      await trainingService.deleteBadge(id);
      runInAction(() => { this.badges = this.badges.filter(b => b._id !== id); });
      notify.success('Insignia eliminada');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar');
      throw err;
    }
  }

  // --- Niveles ---

  async fetchLevels(badgeId?: string) {
    this.isLoading = true;
    try {
      const levels = await trainingService.getLevels(badgeId ? { badge: badgeId } : undefined);
      runInAction(() => { this.levels = levels; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar niveles'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createLevel(data: Partial<Level>) {
    try {
      const level = await trainingService.createLevel(data);
      runInAction(() => { this.levels.push(level); });
      notify.success('Nivel creado exitosamente');
      return level;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al crear nivel');
      throw err;
    }
  }

  async updateLevel(id: string, data: Partial<Level>) {
    try {
      const updated = await trainingService.updateLevel(id, data);
      runInAction(() => {
        const idx = this.levels.findIndex(l => l._id === id);
        if (idx !== -1) this.levels[idx] = updated;
      });
      notify.success('Nivel actualizado');
      return updated;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al actualizar');
      throw err;
    }
  }

  async deleteLevel(id: string) {
    try {
      await trainingService.deleteLevel(id);
      runInAction(() => { this.levels = this.levels.filter(l => l._id !== id); });
      notify.success('Nivel eliminado');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar');
      throw err;
    }
  }

  // --- Cursos ---

  async fetchCourses(levelId?: string) {
    this.isLoading = true;
    try {
      const courses = await trainingService.getCourses(levelId ? { level: levelId } : undefined);
      runInAction(() => { this.courses = courses; });
    } catch (err: any) {
      runInAction(() => { this.error = err.response?.data?.message || 'Error al cargar cursos'; });
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async createCourse(data: Partial<Course>) {
    try {
      const course = await trainingService.createCourse(data);
      runInAction(() => { this.courses.push(course); });
      notify.success('Curso creado exitosamente');
      return course;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al crear curso');
      throw err;
    }
  }

  async updateCourse(id: string, data: Partial<Course>) {
    try {
      const updated = await trainingService.updateCourse(id, data);
      runInAction(() => {
        const idx = this.courses.findIndex(c => c._id === id);
        if (idx !== -1) this.courses[idx] = updated;
      });
      notify.success('Curso actualizado');
      return updated;
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al actualizar');
      throw err;
    }
  }

  async deleteCourse(id: string) {
    try {
      await trainingService.deleteCourse(id);
      runInAction(() => { this.courses = this.courses.filter(c => c._id !== id); });
      notify.success('Curso eliminado');
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Error al eliminar');
      throw err;
    }
  }

  clearError() { this.error = null; }
}

export const trainingStore = new TrainingStore();

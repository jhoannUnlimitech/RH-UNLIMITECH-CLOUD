import { makeAutoObservable, runInAction } from 'mobx';
import { ICSWStore } from './CSWStore.contract';
import { cswService } from '../../api/services/csw';
import { notify } from '../../utils/toast';

/**
 * CSWStore Live Implementation
 * Implementación que conecta con la API real
 */
export class CSWStoreLive implements ICSWStore {
  csws: ICSWStore.CSW[] = [];
  selectedCSW: ICSWStore.CSW | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchCSWs(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const csws = await cswService.getAll();
      runInAction(() => {
        this.csws = csws;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar solicitudes CSW';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchCSWById(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const csw = await cswService.getById(id);
      runInAction(() => {
        this.selectedCSW = csw;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cargar solicitud CSW';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createCSW(data: ICSWStore.CSWInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const newCSW = await cswService.create(data);
      runInAction(() => {
        this.csws.unshift(newCSW);
      });
      notify.success('Solicitud CSW creada exitosamente');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al crear solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al crear solicitud CSW');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createAndSubmitCSW(data: ICSWStore.CSWInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      // 1. Crear el CSW como borrador
      const newCSW = await cswService.create(data);

      // 2. Enviar inmediatamente para aprobación (inicializa la cadena)
      const submittedCSW = await cswService.submit(newCSW._id);

      runInAction(() => {
        this.csws.unshift(submittedCSW);
      });
      notify.success('Solicitud CSW creada y enviada para aprobación');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al crear y enviar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al crear y enviar solicitud CSW');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async updateCSW(id: string, data: ICSWStore.CSWInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedCSW = await cswService.update(id, data);
      runInAction(() => {
        const index = this.csws.findIndex((csw) => csw._id === id);
        if (index !== -1) {
          this.csws[index] = updatedCSW;
        }
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = updatedCSW;
        }
      });
      notify.success('Solicitud CSW actualizada exitosamente');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al actualizar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al actualizar solicitud CSW');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteCSW(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      await cswService.delete(id);
      runInAction(() => {
        this.csws = this.csws.filter((csw) => csw._id !== id);
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = null;
        }
      });
      notify.success('Solicitud CSW eliminada');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al eliminar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al eliminar solicitud CSW');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async approveCSW(id: string, level: number, comments?: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedCSW = await cswService.approve(id, level, comments);
      runInAction(() => {
        const index = this.csws.findIndex((csw) => csw._id === id);
        if (index !== -1) {
          this.csws[index] = updatedCSW;
        }
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = updatedCSW;
        }
      });
      notify.success('Solicitud aprobada exitosamente');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al aprobar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al aprobar solicitud');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async rejectCSW(id: string, level: number, comments: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedCSW = await cswService.reject(id, level, comments);
      runInAction(() => {
        const index = this.csws.findIndex((csw) => csw._id === id);
        if (index !== -1) {
          this.csws[index] = updatedCSW;
        }
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = updatedCSW;
        }
      });
      notify.success('Solicitud rechazada');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al rechazar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al rechazar solicitud');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async cancelCSW(id: string, comments?: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedCSW = await cswService.cancel(id, comments);
      runInAction(() => {
        const index = this.csws.findIndex((csw) => csw._id === id);
        if (index !== -1) {
          this.csws[index] = updatedCSW;
        }
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = updatedCSW;
        }
      });
      notify.success('Solicitud cancelada');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al cancelar solicitud CSW';
      });
      notify.error(err.response?.data?.message || 'Error al cancelar solicitud');
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async submitCSW(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const updatedCSW = await cswService.submit(id);
      runInAction(() => {
        const index = this.csws.findIndex((csw) => csw._id === id);
        if (index !== -1) {
          this.csws[index] = updatedCSW;
        }
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = updatedCSW;
        }
      });
      notify.success('Solicitud enviada para aprobación');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.message || 'Error al enviar solicitud';
      });
      notify.error(err.response?.data?.message || 'Error al enviar solicitud');
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
}

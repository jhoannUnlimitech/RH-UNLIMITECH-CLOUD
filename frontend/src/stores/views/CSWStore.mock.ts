import { makeAutoObservable, runInAction } from 'mobx';
import { ICSWStore } from './CSWStore.contract';

/**
 * CSWStore Mock Implementation
 * Implementación con datos de ejemplo para desarrollo
 */
export class CSWStoreMock implements ICSWStore {
  csws: ICSWStore.CSW[] = [
    {
      _id: '1',
      requester: 'emp1',
      requesterName: 'Juan Pérez',
      requesterPosition: 'Analista de Sistemas',
      requesterDivision: 'div1',
      category: { _id: 'cat1', name: 'Vacaciones' },
      approvalFlowId: 'flow1',
      currentLevel: 1,
      situation: 'Solicito vacaciones del 15 al 30 de enero de 2024 para realizar un viaje familiar planificado con anticipación.',
      information: 'Tengo 15 días de vacaciones acumulados. Los proyectos actuales están en fase de mantenimiento.',
      solution: 'Durante mi ausencia, Carlos Martínez será el contacto principal para cualquier asunto relacionado.',
      status: ICSWStore.CSWStatus.PENDING,
      approvalChain: [
        {
          level: 1,
          name: 'Supervisor Inmediato',
          approverId: 'sup1',
          approverName: 'María González',
          approverPosition: 'Jefa de Desarrollo',
          status: ICSWStore.ApprovalStatus.PENDING,
        },
        {
          level: 2,
          name: 'Gerente de Área',
          approverId: 'ger1',
          approverName: 'Roberto Sánchez',
          approverPosition: 'Gerente de TI',
          status: ICSWStore.ApprovalStatus.PENDING,
        },
      ],
      history: [
        {
          action: 'Solicitud creada',
          performedBy: 'emp1',
          performedByName: 'Juan Pérez',
          performedAt: '2024-01-05T10:30:00Z',
        },
      ],
      deleted: false,
      createdAt: '2024-01-05T10:30:00Z',
      updatedAt: '2024-01-05T10:30:00Z',
    },
    {
      _id: '2',
      requester: 'emp2',
      requesterName: 'Ana Rodríguez',
      requesterPosition: 'Diseñadora UX/UI',
      requesterDivision: 'div2',
      category: { _id: 'cat2', name: 'Capacitación' },
      approvalFlowId: 'flow1',
      currentLevel: 2,
      situation: 'Solicito autorización para asistir al curso "Advanced React Patterns" del 20 al 24 de enero.',
      information: 'El curso tiene un costo de $450 USD y se realiza de 9:00 AM a 1:00 PM en modalidad virtual.',
      solution: 'Propongo que la empresa cubra el 100% del costo. Me comprometo a compartir los conocimientos con el equipo.',
      status: ICSWStore.CSWStatus.APPROVED,
      approvalChain: [
        {
          level: 1,
          name: 'Supervisor Inmediato',
          approverId: 'sup2',
          approverName: 'Luis Morales',
          approverPosition: 'Líder de Diseño',
          status: ICSWStore.ApprovalStatus.APPROVED,
          approvedAt: '2024-01-06T14:20:00Z',
          comments: 'Aprobado. La capacitación es relevante para nuestros proyectos.',
        },
        {
          level: 2,
          name: 'Gerente de Área',
          approverId: 'ger2',
          approverName: 'Patricia Vargas',
          approverPosition: 'Gerente de Producto',
          status: ICSWStore.ApprovalStatus.APPROVED,
          approvedAt: '2024-01-07T09:15:00Z',
          comments: 'Autorizado. Esperamos la presentación al equipo.',
        },
      ],
      history: [
        {
          action: 'Solicitud creada',
          performedBy: 'emp2',
          performedByName: 'Ana Rodríguez',
          performedAt: '2024-01-06T08:45:00Z',
        },
        {
          action: 'Aprobada en nivel 1',
          performedBy: 'sup2',
          performedByName: 'Luis Morales',
          performedAt: '2024-01-06T14:20:00Z',
          level: 1,
          comments: 'Aprobado. La capacitación es relevante.',
        },
        {
          action: 'Aprobada completamente',
          performedBy: 'ger2',
          performedByName: 'Patricia Vargas',
          performedAt: '2024-01-07T09:15:00Z',
          level: 2,
          comments: 'Autorizado. Esperamos la presentación.',
        },
      ],
      deleted: false,
      createdAt: '2024-01-06T08:45:00Z',
      updatedAt: '2024-01-07T09:15:00Z',
    },
    {
      _id: '3',
      requester: 'emp3',
      requesterName: 'Carlos Mendoza',
      requesterPosition: 'Desarrollador Backend',
      requesterDivision: 'div1',
      category: { _id: 'cat3', name: 'Trabajo Remoto' },
      approvalFlowId: 'flow1',
      currentLevel: 2,
      situation: 'Solicito trabajar remoto durante febrero para cuidar a mi madre que se recupera de cirugía.',
      information: 'Cuento con equipos necesarios: laptop, internet de alta velocidad. He trabajado remoto anteriormente.',
      solution: 'Mantendré misma disponibilidad (8:00 AM - 5:00 PM) y asistiré a reuniones por videollamada.',
      status: ICSWStore.CSWStatus.REJECTED,
      approvalChain: [
        {
          level: 1,
          name: 'Supervisor Inmediato',
          approverId: 'sup1',
          approverName: 'María González',
          approverPosition: 'Jefa de Desarrollo',
          status: ICSWStore.ApprovalStatus.APPROVED,
          approvedAt: '2024-01-08T11:30:00Z',
          comments: 'Aprobado. Carlos es responsable y trabaja bien remoto.',
        },
        {
          level: 2,
          name: 'Gerente de Área',
          approverId: 'ger1',
          approverName: 'Roberto Sánchez',
          approverPosition: 'Gerente de TI',
          status: ICSWStore.ApprovalStatus.REJECTED,
          approvedAt: '2024-01-09T16:45:00Z',
          comments: 'Rechazado. Política actual requiere presencia. Considerar híbrido 2 días/semana.',
        },
      ],
      history: [
        {
          action: 'Solicitud creada',
          performedBy: 'emp3',
          performedByName: 'Carlos Mendoza',
          performedAt: '2024-01-08T09:00:00Z',
        },
        {
          action: 'Aprobada en nivel 1',
          performedBy: 'sup1',
          performedByName: 'María González',
          performedAt: '2024-01-08T11:30:00Z',
          level: 1,
          comments: 'Aprobado por mi parte.',
        },
        {
          action: 'Rechazada',
          performedBy: 'ger1',
          performedByName: 'Roberto Sánchez',
          performedAt: '2024-01-09T16:45:00Z',
          level: 2,
          comments: 'Rechazado. Política actual requiere presencia.',
        },
      ],
      deleted: false,
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-01-09T16:45:00Z',
    },
  ];

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

    await new Promise((resolve) => setTimeout(resolve, 300));

    runInAction(() => {
      this.isLoading = false;
    });
  }

  async fetchCSWById(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 200));

    runInAction(() => {
      const csw = this.csws.find((c) => c._id === id);
      this.selectedCSW = csw || null;
      this.isLoading = false;
    });
  }

  async createCSW(data: ICSWStore.CSWInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCSW: ICSWStore.CSW = {
      _id: `${this.csws.length + 1}`,
      requester: 'current-user',
      requesterName: 'Usuario Actual',
      requesterPosition: 'Posición del Usuario',
      requesterDivision: 'div1',
      category: { _id: data.category, name: 'Categoría Seleccionada' },
      approvalFlowId: 'flow1',
      currentLevel: 1,
      situation: data.situation,
      information: data.information,
      solution: data.solution,
      status: ICSWStore.CSWStatus.PENDING,
      approvalChain: [
        {
          level: 1,
          name: 'Supervisor Inmediato',
          approverId: 'sup1',
          approverName: 'Supervisor',
          approverPosition: 'Supervisor',
          status: ICSWStore.ApprovalStatus.PENDING,
        },
      ],
      history: [
        {
          action: 'Solicitud creada',
          performedBy: 'current-user',
          performedByName: 'Usuario Actual',
          performedAt: new Date().toISOString(),
        },
      ],
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    runInAction(() => {
      this.csws.unshift(newCSW);
      this.isLoading = false;
    });
  }

  async updateCSW(id: string, data: ICSWStore.CSWInput): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    runInAction(() => {
      const index = this.csws.findIndex((csw) => csw._id === id);
      if (index !== -1) {
        this.csws[index] = {
          ...this.csws[index],
          category: { _id: data.category, name: this.csws[index].category.name },
          situation: data.situation,
          information: data.information,
          solution: data.solution,
          updatedAt: new Date().toISOString(),
        };
        if (this.selectedCSW?._id === id) {
          this.selectedCSW = this.csws[index];
        }
      }
      this.isLoading = false;
    });
  }

  async deleteCSW(id: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    runInAction(() => {
      this.csws = this.csws.filter((csw) => csw._id !== id);
      if (this.selectedCSW?._id === id) {
        this.selectedCSW = null;
      }
      this.isLoading = false;
    });
  }

  async approveCSW(id: string, level: number, comments?: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    runInAction(() => {
      const index = this.csws.findIndex((csw) => csw._id === id);
      if (index !== -1) {
        const csw = this.csws[index];
        const approvalIndex = csw.approvalChain.findIndex((a) => a.level === level);
        
        if (approvalIndex !== -1) {
          csw.approvalChain[approvalIndex].status = ICSWStore.ApprovalStatus.APPROVED;
          csw.approvalChain[approvalIndex].approvedAt = new Date().toISOString();
          csw.approvalChain[approvalIndex].comments = comments;

          const allApproved = csw.approvalChain.every(
            (a) => a.status === ICSWStore.ApprovalStatus.APPROVED
          );

          if (allApproved) {
            csw.status = ICSWStore.CSWStatus.APPROVED;
          }

          csw.history.push({
            action: allApproved ? 'Aprobada completamente' : `Aprobada en nivel ${level}`,
            performedBy: 'current-user',
            performedByName: 'Usuario Actual',
            performedAt: new Date().toISOString(),
            level,
            comments,
          });

          csw.updatedAt = new Date().toISOString();
          this.csws[index] = csw;

          if (this.selectedCSW?._id === id) {
            this.selectedCSW = csw;
          }
        }
      }
      this.isLoading = false;
    });
  }

  async rejectCSW(id: string, level: number, comments: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    runInAction(() => {
      const index = this.csws.findIndex((csw) => csw._id === id);
      if (index !== -1) {
        const csw = this.csws[index];
        const approvalIndex = csw.approvalChain.findIndex((a) => a.level === level);
        
        if (approvalIndex !== -1) {
          csw.approvalChain[approvalIndex].status = ICSWStore.ApprovalStatus.REJECTED;
          csw.approvalChain[approvalIndex].approvedAt = new Date().toISOString();
          csw.approvalChain[approvalIndex].comments = comments;
          csw.status = ICSWStore.CSWStatus.REJECTED;

          csw.history.push({
            action: 'Rechazada',
            performedBy: 'current-user',
            performedByName: 'Usuario Actual',
            performedAt: new Date().toISOString(),
            level,
            comments,
          });

          csw.updatedAt = new Date().toISOString();
          this.csws[index] = csw;

          if (this.selectedCSW?._id === id) {
            this.selectedCSW = csw;
          }
        }
      }
      this.isLoading = false;
    });
  }

  async cancelCSW(id: string, comments?: string): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    runInAction(() => {
      const index = this.csws.findIndex((csw) => csw._id === id);
      if (index !== -1) {
        const csw = this.csws[index];
        csw.status = ICSWStore.CSWStatus.CANCELLED;

        csw.history.push({
          action: 'Cancelada por el solicitante',
          performedBy: 'current-user',
          performedByName: 'Usuario Actual',
          performedAt: new Date().toISOString(),
          comments,
        });

        csw.updatedAt = new Date().toISOString();
        this.csws[index] = csw;

        if (this.selectedCSW?._id === id) {
          this.selectedCSW = csw;
        }
      }
      this.isLoading = false;
    });
  }

  clearError(): void {
    this.error = null;
  }
}

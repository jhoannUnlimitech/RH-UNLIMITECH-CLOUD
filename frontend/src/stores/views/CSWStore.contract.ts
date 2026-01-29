/**
 * CSW Store Contract
 * Definición de la interfaz y tipos para el store de Solicitudes CSW
 */

export interface ICSWStore {
  csws: ICSWStore.CSW[];
  selectedCSW: ICSWStore.CSW | null;
  isLoading: boolean;
  error: string | null;

  fetchCSWs(): Promise<void>;
  fetchCSWById(id: string): Promise<void>;
  createCSW(data: ICSWStore.CSWInput): Promise<void>;
  updateCSW(id: string, data: ICSWStore.CSWInput): Promise<void>;
  deleteCSW(id: string): Promise<void>;
  approveCSW(id: string, level: number, comments?: string): Promise<void>;
  rejectCSW(id: string, level: number, comments: string): Promise<void>;
  cancelCSW(id: string, comments?: string): Promise<void>;
  clearError(): void;
}

export namespace ICSWStore {
  export enum CSWStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
  }

  export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
  }

  export interface Approval {
    level: number;
    name: string;
    approverId: string;
    approverName: string;
    approverPosition: string;
    status: ApprovalStatus;
    approvedAt?: string;
    comments?: string;
  }

  export interface History {
    action: string;
    performedBy: string;
    performedByName: string;
    performedAt: string;
    level?: number;
    previousStatus?: string;
    newStatus?: string;
    comments?: string;
  }

  export interface CSW {
    _id: string;
    situation: string;
    information: string;
    solution: string;
    requester: string | { _id: string; name: string }; // Puede ser ID o objeto poblado
    requesterName: string;
    requesterPosition: string;
    requesterDivision: string;
    category: {
      _id: string;
      name: string;
    };
    approvalFlowId: string;
    approvalChain: Approval[];
    status: CSWStatus;
    currentLevel: number;
    history: History[];
    deleted: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CSWInput {
    situation: string;
    information: string;
    solution: string;
    category: string;
  }
}

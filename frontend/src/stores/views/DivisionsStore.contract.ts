/**
 * DivisionsStore Contract
 * Define la interfaz y tipos para el store de divisiones
 */

export interface IDivisionsStore {
  // State
  divisions: IDivisionsStore.Division[];
  selectedDivision: IDivisionsStore.Division | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDivisions(): Promise<void>;
  fetchDivisionById(id: string): Promise<void>;
  createDivision(data: IDivisionsStore.DivisionInput): Promise<void>;
  updateDivision(id: string, data: IDivisionsStore.DivisionInput): Promise<void>;
  deleteDivision(id: string): Promise<void>;
  clearError(): void;
  setSelectedDivision(division: IDivisionsStore.Division | null): void;
}

export namespace IDivisionsStore {
  export interface Division {
    _id: string;
    name: string;
    code: string;
    description?: string;
    managerId: string; // ID del empleado representante
    manager?: {
      _id: string;
      name: string;
      email: string;
      photo?: string;
    };
    status: 'active' | 'inactive';
    approvalFlow?: ApprovalLevel[];
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ApprovalLevel {
    order: number;
    employeeId: string;
    employeeName: string;
    employeePosition?: string;
  }
  
  export interface DivisionInput {
    name: string;
    code: string;
    description?: string;
    managerId: string; // ID del empleado representante
    status?: 'active' | 'inactive';
    approvalFlow?: ApprovalLevel[];

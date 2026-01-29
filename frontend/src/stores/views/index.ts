import { IAuthStore } from './AuthStore.contract';
import { AuthStoreMock } from './AuthStore.mock';
import { AuthStoreLive } from './AuthStore.live';
import { IDivisionsStore } from './DivisionsStore.contract';
import { DivisionsStoreMock } from './DivisionsStore.mock';
import { DivisionsStoreLive } from './DivisionsStore.live';
import { IEmployeesStore } from './EmployeesStore.contract';
import { EmployeesStoreMock } from './EmployeesStore.mock';
import { EmployeesStoreLive } from './EmployeesStore.live';
import { IRolesStore } from './RolesStore.contract';
import { RolesStoreMock } from './RolesStore.mock';
import { RolesStoreLive } from './RolesStore.live';
import { ICSWCategoryStore } from './CSWCategoryStore.contract';
import { CSWCategoryStoreMock } from './CSWCategoryStore.mock';
import { CSWCategoryStoreLive } from './CSWCategoryStore.live';
import { ICSWStore } from './CSWStore.contract';
import { CSWStoreMock } from './CSWStore.mock';
import { CSWStoreLive } from './CSWStore.live';

/**
 * Factory para crear el store de autenticación
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createAuthStore(mode: 'mock' | 'live' = 'mock'): IAuthStore {
  return mode === 'mock' ? new AuthStoreMock() : new AuthStoreLive();
}

/**
 * Factory para crear el store de divisiones
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createDivisionsStore(mode: 'mock' | 'live' = 'mock'): IDivisionsStore {
  return mode === 'mock' ? new DivisionsStoreMock() : new DivisionsStoreLive();
}

/**
 * Factory para crear el store de empleados
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createEmployeesStore(mode: 'mock' | 'live' = 'mock'): IEmployeesStore {
  return mode === 'mock' ? new EmployeesStoreMock() : new EmployeesStoreLive();
}

/**
 * Factory para crear el store de roles
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createRolesStore(mode: 'mock' | 'live' = 'mock'): IRolesStore {
  return mode === 'mock' ? new RolesStoreMock() : new RolesStoreLive();
}

/**
 * Factory para crear el store de categorías CSW
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createCSWCategoryStore(mode: 'mock' | 'live' = 'mock'): ICSWCategoryStore {
  return mode === 'mock' ? new CSWCategoryStoreMock() : new CSWCategoryStoreLive();
}

/**
 * Factory para crear el store de CSW
 * @param mode - 'mock' para desarrollo con datos de ejemplo, 'live' para producción
 */
export function createCSWStore(mode: 'mock' | 'live' = 'mock'): ICSWStore {
  return mode === 'mock' ? new CSWStoreMock() : new CSWStoreLive();
}

// Singletons de stores
export const authStore = createAuthStore('live');
export const divisionsStore = createDivisionsStore('live');
export const employeesStore = createEmployeesStore('live');
export const rolesStore = createRolesStore('live');
export const cswCategoryStore = createCSWCategoryStore('live');
export const cswStore = createCSWStore('live');

export type { IAuthStore, IDivisionsStore, IEmployeesStore, IRolesStore, ICSWCategoryStore, ICSWStore };
export { 
  AuthStoreMock, 
  AuthStoreLive, 
  DivisionsStoreMock, 
  DivisionsStoreLive, 
  EmployeesStoreMock, 
  EmployeesStoreLive,
  RolesStoreMock,
  RolesStoreLive,
  CSWCategoryStoreMock,
  CSWCategoryStoreLive,
  CSWStoreMock,
  CSWStoreLive
};



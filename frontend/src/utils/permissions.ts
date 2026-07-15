/**
 * Utilidades para manejo de permisos
 */

import { IAuthStore } from '../stores/views/AuthStore.contract';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'cancel' | 'manage' | 'report';
export type PermissionResource = 
  | 'employees' 
  | 'divisions' 
  | 'roles' 
  | 'permissions' 
  | 'csw' 
  | 'csw_categories'
  | 'approval_flows' 
  | 'training'
  | 'projects'
  | 'policies'
  | 'tasks';

/**
 * Verifica si el usuario tiene un permiso específico
 */
export const hasPermission = (
  permissions: IAuthStore.Permission[] | undefined,
  resource: PermissionResource,
  action: PermissionAction
): boolean => {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some(
    (perm) => perm.resource === resource && perm.action === action
  );
};

/**
 * Verifica si el usuario tiene al menos un permiso en un recurso
 */
export const hasAnyPermissionInResource = (
  permissions: IAuthStore.Permission[] | undefined,
  resource: PermissionResource
): boolean => {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some((perm) => perm.resource === resource);
};

/**
 * Obtiene todos los permisos de un recurso específico
 */
export const getResourcePermissions = (
  permissions: IAuthStore.Permission[] | undefined,
  resource: PermissionResource
): PermissionAction[] => {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  return permissions
    .filter((perm) => perm.resource === resource)
    .map((perm) => perm.action as PermissionAction);
};

/**
 * Verifica múltiples permisos (requiere todos)
 */
export const hasAllPermissions = (
  permissions: IAuthStore.Permission[] | undefined,
  checks: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean => {
  return checks.every((check) =>
    hasPermission(permissions, check.resource, check.action)
  );
};

/**
 * Verifica múltiples permisos (requiere al menos uno)
 */
export const hasAnyPermission = (
  permissions: IAuthStore.Permission[] | undefined,
  checks: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean => {
  return checks.some((check) =>
    hasPermission(permissions, check.resource, check.action)
  );
};

/**
 * Hook para verificar permisos del usuario actual
 */

import { useEffect, useState } from 'react';
import { authStore } from '../stores/views';
import { 
  hasPermission, 
  hasAnyPermissionInResource, 
  getResourcePermissions,
  hasAllPermissions,
  hasAnyPermission,
  PermissionAction,
  PermissionResource
} from '../utils/permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState(authStore.user?.role?.permissions || []);

  useEffect(() => {
    // Actualizar permisos cuando el usuario cambie
    setPermissions(authStore.user?.role?.permissions || []);
  }, [authStore.user]);

  return {
    permissions,
    
    /**
     * Verifica si tiene un permiso específico
     */
    can: (resource: PermissionResource, action: PermissionAction): boolean => {
      return hasPermission(permissions, resource, action);
    },

    /**
     * Verifica si tiene al menos un permiso en un recurso
     */
    canAccessResource: (resource: PermissionResource): boolean => {
      return hasAnyPermissionInResource(permissions, resource);
    },

    /**
     * Obtiene todos los permisos de un recurso
     */
    getResourcePermissions: (resource: PermissionResource): PermissionAction[] => {
      return getResourcePermissions(permissions, resource);
    },

    /**
     * Verifica múltiples permisos (requiere todos)
     */
    canAll: (checks: Array<{ resource: PermissionResource; action: PermissionAction }>): boolean => {
      return hasAllPermissions(permissions, checks);
    },

    /**
     * Verifica múltiples permisos (requiere al menos uno)
     */
    canAny: (checks: Array<{ resource: PermissionResource; action: PermissionAction }>): boolean => {
      return hasAnyPermission(permissions, checks);
    }
  };
};

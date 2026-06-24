/**
 * Componente para proteger rutas basado en permisos
 */

import { Navigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores/views';
import { hasAnyPermissionInResource, PermissionResource } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource: PermissionResource;
  redirectTo?: string;
}

export const ProtectedRoute = observer(({ 
  children, 
  resource, 
  redirectTo = '/unauthorized' 
}: ProtectedRouteProps) => {
  const user = authStore.user;
  const permissions = user?.role?.permissions || [];

  // Si no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Si no tiene ningún permiso en el recurso, redirigir
  if (!hasAnyPermissionInResource(permissions, resource)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
});

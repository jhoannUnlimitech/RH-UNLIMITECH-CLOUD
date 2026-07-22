import { observer } from "mobx-react-lite";
import { Navigate } from "react-router";
import { authStore } from "../../stores/views";
import { hasAnyPermissionInResource, hasPermission, PermissionResource, PermissionAction } from "../../utils/permissions";

interface PermissionRouteProps {
  children: React.ReactNode;
  resource: PermissionResource;
  action?: PermissionAction; // Si se especifica, verifica que tenga resource:action específico
}

/**
 * Componente que protege rutas verificando permisos del usuario.
 *
 * - Sin `action`: verifica que tenga al menos un permiso en el recurso.
 * - Con `action`: verifica que tenga el permiso específico resource:action.
 *
 * Si no tiene permiso → redirige al Dashboard.
 */
const PermissionRoute = observer(({ children, resource, action }: PermissionRouteProps) => {
  const permissions = authStore.user?.role?.permissions || [];

  if (action) {
    // Verificar permiso específico: resource:action
    if (!hasPermission(permissions, resource, action)) {
      return <Navigate to="/" replace />;
    }
  } else {
    // Verificar que tenga al menos un permiso en el recurso
    if (!hasAnyPermissionInResource(permissions, resource)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
});

export default PermissionRoute;

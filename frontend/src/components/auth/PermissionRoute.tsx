import { observer } from "mobx-react-lite";
import { Navigate } from "react-router";
import { authStore } from "../../stores/views";
import { hasAnyPermissionInResource, PermissionResource } from "../../utils/permissions";

interface PermissionRouteProps {
  children: React.ReactNode;
  resource: PermissionResource;
}

/**
 * Componente que protege rutas verificando que el usuario tenga
 * al menos un permiso en el recurso indicado.
 * Si no tiene permiso → redirige al Dashboard.
 */
const PermissionRoute = observer(({ children, resource }: PermissionRouteProps) => {
  const permissions = authStore.user?.role?.permissions || [];

  if (!hasAnyPermissionInResource(permissions, resource)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
});

export default PermissionRoute;

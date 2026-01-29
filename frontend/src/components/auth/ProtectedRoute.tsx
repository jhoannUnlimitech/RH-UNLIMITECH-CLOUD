import { observer } from "mobx-react-lite";
import { Navigate } from "react-router";
import { authStore } from "../../stores/views";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas requiriendo autenticación
 * Si el usuario no está autenticado, redirige a /signin
 */
const ProtectedRoute = observer(({ children }: ProtectedRouteProps) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
});

export default ProtectedRoute;

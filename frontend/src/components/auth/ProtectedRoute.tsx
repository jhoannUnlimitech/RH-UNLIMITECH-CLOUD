import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router";
import { authStore } from "../../stores/views";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas requiriendo autenticación.
 * Si el usuario no está autenticado, redirige a /signin.
 * Si el usuario tiene forcePasswordChange=true, redirige a /change-password.
 * Espera a que checkAuth termine antes de decidir.
 */
const ProtectedRoute = observer(({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  // Mientras verifica autenticación, no redirigir
  if (authStore.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Si debe cambiar contraseña y no está en la página de cambio
  if (authStore.user?.forcePasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
});

export default ProtectedRoute;

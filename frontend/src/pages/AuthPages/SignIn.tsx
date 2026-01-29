import { observer } from "mobx-react-lite";
import { Navigate } from "react-router";
import PageMeta from "../../utils/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { authStore } from "../../stores/views";

const SignIn = observer(() => {
  // Si ya está autenticado, redirigir al dashboard
  if (authStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageMeta
        title="Iniciar Sesión - RH UNLIMITECH"
        description="Accede al Sistema de Gestión de Recursos Humanos"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
});

export default SignIn;

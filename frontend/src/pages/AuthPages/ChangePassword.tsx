import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { authStore } from "../../stores/views";
import PageMeta from "../../utils/PageMeta";
import AuthLayout from "./AuthPageLayout";

const ChangePassword = observer(() => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Débil", color: "bg-red-500", width: "33%" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial, password.length >= 8].filter(Boolean).length;
    if (score >= 3) return { label: "Fuerte", color: "bg-green-500", width: "100%" };
    if (score >= 2) return { label: "Media", color: "bg-yellow-500", width: "66%" };
    return { label: "Débil", color: "bg-red-500", width: "33%" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones frontend
    if (!currentPassword) {
      setError("La contraseña actual es requerida");
      return;
    }
    if (!newPassword) {
      setError("La nueva contraseña es requerida");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      await authStore.changePassword(currentPassword, newPassword);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Cambiar Contraseña - RH UNLIMITECH"
        description="Actualiza tu contraseña"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1" data-test-context="change-password-page">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1
                  className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"
                  data-test-key="page-title"
                >
                  Cambiar Contraseña
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {authStore.user?.forcePasswordChange
                    ? "Debes actualizar tu contraseña antes de continuar"
                    : "Actualiza tu contraseña de acceso"}
                </p>
              </div>

              {error && (
                <div
                  className="p-4 mb-5 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400"
                  data-test-key="error-message"
                  data-test-state="visible"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                data-test-context="change-password-form"
                data-test-state={isLoading ? "loading" : "ready"}
              >
                <div className="space-y-5" data-test-context="form-inputs">
                  {/* Current Password */}
                  <div>
                    <Label>Contraseña Actual <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        data-test-key="current-password-input"
                      />
                      <span
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showCurrent ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label>Nueva Contraseña <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Ingresa la nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        data-test-key="new-password-input"
                      />
                      <span
                        onClick={() => setShowNew(!showNew)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showNew ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                    {/* Strength Meter */}
                    {newPassword && (
                      <div className="mt-2" data-test-key="password-strength">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                          <div
                            className={`h-1.5 rounded-full transition-all ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Seguridad: <span className="font-medium">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label>Confirmar Contraseña <span className="text-error-500">*</span></Label>
                    <Input
                      type="password"
                      placeholder="Confirma la nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      data-test-key="confirm-password-input"
                      data-test-state={confirmPassword && confirmPassword !== newPassword ? "error" : "normal"}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                      data-test-key="submit-button"
                      data-test-state={isLoading ? "loading" : "ready"}
                    >
                      {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
});

export default ChangePassword;

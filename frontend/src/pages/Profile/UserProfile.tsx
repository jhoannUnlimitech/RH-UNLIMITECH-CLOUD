import { observer } from "mobx-react-lite";
import { useState, useRef } from "react";
import { authStore } from "../../stores/views";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../utils/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { notify } from "../../utils/toast";
import { employeesService } from "../../api/services/employees";
import { EyeCloseIcon, EyeIcon } from "../../icons";

const UserProfile = observer(() => {
  const user = authStore.user;
  const editInfoModal = useModal();
  const changePasswordModal = useModal();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Edit Info form state
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    nationalId: "",
    nationality: "",
    birthDate: "",
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Change Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
      </div>
    );
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Password strength
  const getStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    if (pwd.length < 6) return { label: "Débil", color: "bg-red-500", width: "33%" };
    const score = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[!@#$%^&*]/.test(pwd), pwd.length >= 8].filter(Boolean).length;
    if (score >= 3) return { label: "Fuerte", color: "bg-green-500", width: "100%" };
    if (score >= 2) return { label: "Media", color: "bg-yellow-500", width: "66%" };
    return { label: "Débil", color: "bg-red-500", width: "33%" };
  };
  const strength = getStrength(passwordForm.newPassword);

  // ─── Edit Info ────────────────────────────────────────────────────────
  const handleOpenEditInfo = () => {
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      nationalId: user.nationalId || "",
      nationality: user.nationality || "",
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
    });
    editInfoModal.openModal();
  };

  const handleSaveInfo = async () => {
    if (!user._id) return;
    setIsSavingInfo(true);
    try {
      await employeesService.update(user._id, {
        name: editForm.name,
        phone: editForm.phone,
        nationalId: editForm.nationalId,
        nationality: editForm.nationality,
        birthDate: editForm.birthDate,
      });
      await authStore.checkAuth();
      editInfoModal.closeModal();
      notify.success("Perfil actualizado exitosamente");
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ─── Change Photo ─────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user._id) return;
    if (file.size > 2 * 1024 * 1024) {
      notify.error("La foto no debe superar 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await employeesService.update(user._id, { photo: reader.result as string });
        await authStore.checkAuth();
        notify.success("Foto actualizada");
      } catch {
        notify.error("Error al actualizar foto");
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── Change Password ──────────────────────────────────────────────────
  const handleOpenChangePassword = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    changePasswordModal.openModal();
  };

  const handleSubmitPassword = async () => {
    setPasswordError("");
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword) { setPasswordError("La contraseña actual es requerida"); return; }
    if (!newPassword) { setPasswordError("La nueva contraseña es requerida"); return; }
    if (newPassword.length < 6) { setPasswordError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword === currentPassword) { setPasswordError("La nueva contraseña debe ser diferente a la actual"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Las contraseñas no coinciden"); return; }

    setIsSavingPassword(true);
    try {
      await authStore.changePassword(currentPassword, newPassword);
      changePasswordModal.closeModal();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Projects from /auth/me
  const projects = (user as any).projects || [];

  return (
    <>
      <PageMeta title="Mi Perfil - RH UNLIMITECH" description="Perfil de usuario" />
      <PageBreadcrumb pageTitle="Mi Perfil" />

      <div className="space-y-6" data-test-context="profile-page">
        {/* ─── Header Card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6" data-test-context="profile-header">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              {/* Avatar with edit */}
              <div className="relative group">
                <div className="w-20 h-20 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700 flex items-center justify-center bg-brand-100 dark:bg-brand-900/30">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" data-test-key="profile-photo" />
                  ) : (
                    <span className="text-2xl font-bold text-brand-600 dark:text-brand-400" data-test-key="profile-initials">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600 transition"
                  data-test-key="edit-photo-button"
                  title="Cambiar foto"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Name + role + division */}
              <div className="text-center xl:text-left">
                <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90" data-test-key="profile-name">{user.name}</h4>
                <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3">
                  <Badge color="info" data-test-key="profile-role">{user.role?.name || "Sin hat"}</Badge>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400" data-test-key="profile-division">{user.division?.name || "Sin división"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Personal Info Card ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6" data-test-context="profile-info">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Información Personal</h4>
            <button
              onClick={handleOpenEditInfo}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              data-test-key="edit-info-button"
            >
              <svg className="fill-current h-4 w-4" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z" fill="" />
              </svg>
              Editar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="profile-email">{user.email}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="profile-phone">{user.phone || "No registrado"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Cédula</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="profile-national-id">{user.nationalId || "No registrado"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Nacionalidad</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="profile-nationality">{user.nationality || "No registrado"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="profile-birth-date">
                {user.birthDate ? new Date(user.birthDate).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "No registrado"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Estado</p>
              <Badge color="success" data-test-key="profile-status">Activo</Badge>
            </div>
          </div>
        </div>

        {/* ─── Division & Projects Card ────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6" data-test-context="profile-division-card">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">División y Proyectos</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">División</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90" data-test-key="division-name">{user.division?.name || "Sin división"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Hat</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.role?.name || "Sin hat"}</p>
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proyectos Asignados</p>
              <div className="space-y-2">
                {projects.map((project: any, idx: number) => (
                  <div key={project._id || idx} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3" data-test-key={`project-item-${idx + 1}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{project.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{project.code}</p>
                    </div>
                    <Badge color={project.status === 'active' ? 'success' : 'light'} size="sm">
                      {project.status === 'active' ? 'Activo' : project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {projects.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No hay proyectos asignados</p>
          )}
        </div>

        {/* ─── Security Card ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6" data-test-context="profile-security">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Seguridad</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Contraseña</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cambia tu contraseña de acceso al sistema</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleOpenChangePassword} data-test-key="change-password-button">
              Cambiar Contraseña
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Edit Info Modal ───────────────────────────────────────────── */}
      <Modal isOpen={editInfoModal.isOpen} onClose={editInfoModal.closeModal} className="max-w-lg">
        <div className="p-6" data-test-context="edit-info-modal">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Editar Información Personal</h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Actualiza tus datos personales. Email y estado no pueden ser modificados.</p>

          <div className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} disabled={isSavingInfo} data-test-key="edit-name-input" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} disabled={isSavingInfo} data-test-key="edit-phone-input" />
            </div>
            <div>
              <Label>Cédula</Label>
              <Input type="text" value={editForm.nationalId} onChange={(e) => setEditForm(p => ({ ...p, nationalId: e.target.value }))} disabled={isSavingInfo} data-test-key="edit-national-id-input" />
            </div>
            <div>
              <Label>Nacionalidad</Label>
              <Input type="text" value={editForm.nationality} onChange={(e) => setEditForm(p => ({ ...p, nationality: e.target.value }))} disabled={isSavingInfo} data-test-key="edit-nationality-input" />
            </div>
            <div>
              <Label>Fecha de Nacimiento</Label>
              <Input type="date" value={editForm.birthDate} onChange={(e) => setEditForm(p => ({ ...p, birthDate: e.target.value }))} disabled={isSavingInfo} data-test-key="edit-birth-date-input" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 justify-end">
            <Button variant="outline" size="sm" onClick={editInfoModal.closeModal} disabled={isSavingInfo} data-test-key="modal-cancel-button">Cancelar</Button>
            <Button size="sm" onClick={handleSaveInfo} disabled={isSavingInfo} data-test-key="modal-save-button" data-test-state={isSavingInfo ? "loading" : "ready"}>
              {isSavingInfo ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Change Password Modal ─────────────────────────────────────── */}
      <Modal isOpen={changePasswordModal.isOpen} onClose={changePasswordModal.closeModal} className="max-w-lg">
        <div className="p-6" data-test-context="change-password-modal">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Cambiar Contraseña</h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Ingresa tu contraseña actual y define una nueva.</p>

          {passwordError && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400" data-test-key="error-message" data-test-state="visible">
              {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Contraseña Actual <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showCurrentPwd ? "text" : "password"}
                  placeholder="Ingresa tu contraseña actual"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  disabled={isSavingPassword}
                  data-test-key="current-password-input"
                />
                <span onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                  {showCurrentPwd ? <EyeIcon className="fill-gray-500 size-5" /> : <EyeCloseIcon className="fill-gray-500 size-5" />}
                </span>
              </div>
            </div>

            <div>
              <Label>Nueva Contraseña <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showNewPwd ? "text" : "password"}
                  placeholder="Ingresa la nueva contraseña"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  disabled={isSavingPassword}
                  data-test-key="new-password-input"
                />
                <span onClick={() => setShowNewPwd(!showNewPwd)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                  {showNewPwd ? <EyeIcon className="fill-gray-500 size-5" /> : <EyeCloseIcon className="fill-gray-500 size-5" />}
                </span>
              </div>
              {passwordForm.newPassword && (
                <div className="mt-2" data-test-key="password-strength">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Seguridad: <span className="font-medium">{strength.label}</span></p>
                </div>
              )}
            </div>

            <div>
              <Label>Confirmar Contraseña <span className="text-error-500">*</span></Label>
              <Input
                type="password"
                placeholder="Confirma la nueva contraseña"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                disabled={isSavingPassword}
                data-test-key="confirm-password-input"
              />
              {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 justify-end">
            <Button variant="outline" size="sm" onClick={changePasswordModal.closeModal} disabled={isSavingPassword} data-test-key="modal-cancel-button">Cancelar</Button>
            <Button size="sm" onClick={handleSubmitPassword} disabled={isSavingPassword} data-test-key="modal-submit-button" data-test-state={isSavingPassword ? "loading" : "ready"}>
              {isSavingPassword ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default UserProfile;

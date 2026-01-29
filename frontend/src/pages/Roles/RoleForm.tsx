import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { rolesStore } from "../../stores/views";
import apiClient from "../../api/client";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Alert from "../../components/ui/alert/Alert";
import Switch from "../../components/form/switch/Switch";
import {
  UserIcon,
  BoxCubeIcon,
  LockIcon,
  PlugInIcon,
  FileIcon,
  CheckCircleIcon,
  DocsIcon,
  BoxIcon,
} from "../../icons";

interface Permission {
  _id: string;
  resource: string;
  action: string;
}

// Mapeo de recursos a nombres en español
const resourceNames: Record<string, string> = {
  // Módulos principales (virtuales, no tienen permisos directos)
  administration: "Administración",
  csw: "Solicitudes CSW",
  
  // Submódulos de Administración
  employees: "Empleados",
  divisions: "Divisiones",
  roles: "Roles",
  permissions: "Permisos",
  
  // Submódulos de CSW
  csw_categories: "Categorías CSW",
  
  // Otros módulos principales
  approval_flows: "Flujos de Aprobación",
  training: "Capacitaciones",
};

// Mapeo de acciones a nombres en español
const actionNames: Record<string, string> = {
  read: "Ver",
  create: "Crear",
  update: "Editar",
  delete: "Eliminar",
  approve: "Aprobar",
  cancel: "Cancelar",
};

// Iconos para cada módulo usando webforge icons
const moduleIcons: Record<string, React.ReactNode> = {
  // Módulos principales
  administration: <LockIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  csw: <FileIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  
  // Submódulos de Administración
  employees: <UserIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  divisions: <BoxCubeIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  roles: <LockIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  permissions: <PlugInIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  
  // Submódulos de CSW
  csw_categories: <BoxIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  
  // Otros módulos
  approval_flows: <CheckCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  training: <DocsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
};

const RoleForm = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar permisos disponibles
  useEffect(() => {
    loadPermissions();
  }, []);

  // Cargar datos del rol en modo edición
  useEffect(() => {
    if (isEditMode && id) {
      loadRoleData();
    }
  }, [isEditMode, id]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await apiClient.get('/permissions');
      console.log("🔍 RAW Response:", response);
      console.log("🔍 Response.data:", response.data);
      
      // El backend devuelve { success: true, count: N, data: [...], grouped: {...} }
      const permissions = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
      
      console.log("Permisos cargados:", permissions);
      console.log("Total permisos:", permissions.length);
      
      if (!Array.isArray(permissions) || permissions.length === 0) {
        console.error("No se encontraron permisos:", permissions);
        setError("No hay permisos disponibles en el sistema");
        setAvailablePermissions([]);
        return;
      }
      
      // Verificar estructura
      console.log("Primer permiso:", permissions[0]);
      
      // Agrupar permisos por módulo para diagnóstico
      const grouped = permissions.reduce((acc, p) => {
        acc[p.resource] = (acc[p.resource] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log("Permisos por módulo:", grouped);
      
      setAvailablePermissions(permissions);
    } catch (err) {
      console.error("Error al cargar permisos:", err);
      setError("Error al cargar los permisos");
      setAvailablePermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const loadRoleData = async () => {
    if (!id) return;

    try {
      let role = rolesStore.roles.find((r) => r._id === id);

      if (!role) {
        await rolesStore.fetchRoleById(id);
        role = rolesStore.selectedRole || undefined;
      }

      if (role) {
        console.log('Cargando rol:', role);
        setName(role.name);
        const permissionIds = role.permissions.map((p) =>
          typeof p === "string" ? p : p._id
        );
        console.log('Permisos del rol cargados:', permissionIds);
        setSelectedPermissions(permissionIds);
      }
    } catch (err) {
      console.error("Error al cargar datos del rol:", err);
      setError("Error al cargar los datos del rol");
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    console.log('Toggle permission:', permissionId);
    setSelectedPermissions((prev) => {
      console.log('Current selected:', prev);
      const newSelected = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId];
      console.log('New selected:', newSelected);
      return newSelected;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre del rol es obligatorio");
      return;
    }

    if (selectedPermissions.length === 0) {
      setError("Debe seleccionar al menos un permiso");
      return;
    }

    try {
      setIsSubmitting(true);

      const roleData = {
        name: name.trim().toUpperCase(),
        permissions: selectedPermissions,
      };

      if (isEditMode && id) {
        await rolesStore.updateRole(id, roleData);
      } else {
        await rolesStore.createRole(roleData);
      }

      await rolesStore.fetchRoles();
      navigate("/roles");
    } catch (err: any) {
      setError(err.message || "Error al guardar el rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar permisos por recurso con jerarquía de módulos
  const groupedPermissions = Array.isArray(availablePermissions)
    ? availablePermissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>)
    : {};

  // Definir jerarquía de módulos: módulos principales y sus submódulos
  const moduleHierarchy: Record<string, string[]> = {
    administration: ['employees', 'divisions', 'roles', 'permissions'], // Módulos administrativos
    csw: ['csw_categories'], // CSW y sus categorías
    approval_flows: [], // Flujos de aprobación
    training: [], // Capacitaciones
  };

  // Obtener módulos principales (que tienen permisos o submódulos)
  const mainModules = Object.keys(moduleHierarchy).filter(
    (module) => groupedPermissions[module] || moduleHierarchy[module].length > 0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle={isEditMode ? "Editar Rol" : "Nuevo Rol"} />

      {/* Error Display */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Form Container */}
      <div className="rounded-xl bg-white dark:bg-white/[0.03] p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? "Editar Rol" : "Crear Nuevo Rol"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isEditMode
                ? "Actualiza el nombre y los permisos del rol"
                : "Define el nombre y asigna los permisos que tendrá este rol"}
            </p>
          </div>

          {/* Nombre del Rol */}
          <div className="max-w-2xl">
            <Label htmlFor="roleName">Nombre del Rol *</Label>
            <input
              id="roleName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: ADMINISTRADOR, GERENTE, SUPERVISOR"
              className="w-full h-11 rounded-lg border appearance-none px-3.5 py-2.5 text-theme-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              disabled={isSubmitting || loadingPermissions}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              El nombre se convertirá automáticamente a mayúsculas
            </p>
          </div>

          {/* Permisos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Permisos del Rol *
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selecciona los permisos que tendrá este rol
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-brand-600 dark:text-brand-400">
                  {selectedPermissions.length}
                </span>{" "}
                / {availablePermissions.length} seleccionados
              </div>
            </div>

            {loadingPermissions ? (
              <div className="flex items-center justify-center p-12 border border-gray-200 dark:border-gray-800 rounded-xl">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-300 rounded-full border-t-brand-600 animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cargando permisos...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {mainModules.map((mainModule) => {
                  const mainPermissions = groupedPermissions[mainModule] || [];
                  const subModules = moduleHierarchy[mainModule] || [];
                  const allModulePermissions = [
                    ...mainPermissions,
                    ...subModules.flatMap(sub => groupedPermissions[sub] || [])
                  ];
                  const allSelected = allModulePermissions.every((p) =>
                    selectedPermissions.includes(p._id)
                  );

                  return (
                    <div
                      key={mainModule}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-brand-300 dark:hover:border-brand-800 transition-colors"
                    >
                      {/* Module Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                            {moduleIcons[mainModule] || <BoxIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                              {resourceNames[mainModule] || mainModule}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {allModulePermissions.length} permisos disponibles
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const allIds = allModulePermissions.map(p => p._id);
                            if (allSelected) {
                              setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
                            } else {
                              setSelectedPermissions(prev => [...new Set([...prev, ...allIds])]);
                            }
                          }}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                          disabled={isSubmitting}
                        >
                          {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                        </button>
                      </div>

                      {/* Main Module Permissions */}
                      {mainPermissions.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {mainPermissions.map((permission) => {
                            const isChecked = selectedPermissions.includes(permission._id);
                            return (
                              <div
                                key={`${mainModule}-${permission._id}`}
                                className={`p-3 rounded-lg transition-all border ${
                                  isChecked
                                    ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800"
                                    : "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800"
                                }`}
                              >
                                <Switch
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(permission._id)}
                                  disabled={isSubmitting}
                                  label={actionNames[permission.action] || permission.action}
                                  color="blue"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Sub-modules */}
                      {subModules.map((subModule) => {
                        const subPermissions = groupedPermissions[subModule] || [];
                        if (subPermissions.length === 0) return null;

                        return (
                          <div key={subModule} className="mt-4 pl-4 border-l-2 border-brand-200 dark:border-brand-800">
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              {resourceNames[subModule] || subModule}
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {subPermissions.map((permission) => {
                                const isChecked = selectedPermissions.includes(permission._id);
                                return (
                                  <div
                                    key={`${subModule}-${permission._id}`}
                                    className={`p-3 rounded-lg transition-all border ${
                                      isChecked
                                        ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800"
                                        : "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800"
                                    }`}
                                  >
                                    <Switch
                                      checked={isChecked}
                                      onChange={() => handlePermissionToggle(permission._id)}
                                      disabled={isSubmitting}
                                      label={actionNames[permission.action] || permission.action}
                                      color="blue"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {mainModules.length === 0 && (
                  <div className="text-center p-12 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay permisos disponibles
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/roles")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loadingPermissions}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Guardando...
                </>
              ) : isEditMode ? (
                "Actualizar Rol"
              ) : (
                "Crear Rol"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default RoleForm;

import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { rolesStore } from "../../stores/views";
import apiClient from "../../api/client";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
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
  administration: "Administración",
  csw: "Solicitudes CSW",
  employees: "Empleados",
  divisions: "Divisiones",
  roles: "Roles",
  permissions: "Permisos",
  csw_categories: "Categorías CSW",
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

// Iconos para cada módulo
const moduleIcons: Record<string, React.ReactNode> = {
  administration: <LockIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  csw: <FileIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  employees: <UserIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  divisions: <BoxCubeIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  roles: <LockIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  permissions: <PlugInIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  csw_categories: <BoxIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  approval_flows: <CheckCircleIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
  training: <DocsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
};

const RolesView = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    if (id) {
      loadPermissions();
      loadRoleData();
    }
  }, [id]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await apiClient.get('/permissions');
      const permissions = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
          ? response.data 
          : [];
      setAvailablePermissions(permissions);
    } catch (err) {
      console.error("Error al cargar permisos:", err);
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
        setRoleName(role.name);
        const permissionIds = role.permissions.map((p) =>
          typeof p === "string" ? p : p._id
        );
        setSelectedPermissions(permissionIds);
      }
    } catch (err) {
      console.error("Error al cargar datos del rol:", err);
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const module = permission.resource;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Jerarquía de módulos
  const moduleHierarchy: Record<string, string[]> = {
    administration: ["employees", "divisions", "roles", "permissions"],
    csw: ["csw_categories"],
  };

  const mainModules = Object.keys(groupedPermissions).filter(
    (module) => !Object.values(moduleHierarchy).flat().includes(module)
  );

  const role = rolesStore.roles.find((r) => r._id === id);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={`Ver Rol: ${roleName}`} />

      {/* Form Container */}
      <div className="rounded-xl bg-white dark:bg-white/[0.03] p-6 lg:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {roleName}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Vista de solo lectura de los permisos del rol
                </p>
              </div>
              <Button onClick={() => navigate(`/roles/edit/${id}`)}>
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.25 2.25L15.75 3.75M2 16H4L14.25 5.75C14.8023 5.19772 15.0284 4.97157 15.0284 4.71428C15.0284 4.45699 14.8023 4.23084 14.25 3.67856C13.6977 3.12627 13.473 2.9 13.2157 2.9C12.9584 2.9 12.7323 3.12627 12.18 3.67856L2 13.8586V16Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Editar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/[0.05]">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                Total de Permisos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedPermissions.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/[0.05]">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                Empleados Asignados
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {role?.employeesCount || 0}
              </p>
            </div>
          </div>

          {/* Permisos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Permisos del Rol
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vista de los permisos asignados a este rol
                </p>
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

                  return (
                    <div
                      key={mainModule}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl p-6"
                    >
                      {/* Module Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                          {moduleIcons[mainModule] || <BoxIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {resourceNames[mainModule] || mainModule}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {allModulePermissions.filter(p => selectedPermissions.includes(p._id)).length} de {allModulePermissions.length} permisos
                          </p>
                        </div>
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
                                  onChange={() => {}}
                                  disabled={true}
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
                                      onChange={() => {}}
                                      disabled={true}
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
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/roles")}
            >
              Atrás
            </Button>
            <Button onClick={() => navigate(`/roles/edit/${id}`)}>
              Editar Rol
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RolesView;

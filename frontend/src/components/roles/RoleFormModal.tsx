import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { rolesStore } from "../../stores/views";
import { permissionsService } from "../../api/services/permissions";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Alert from "../ui/alert/Alert";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string;
}

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description?: string;
}

// Mapeo de recursos a nombres en español
const resourceNames: Record<string, string> = {
  employees: 'Empleados',
  divisions: 'Divisiones',
  roles: 'Roles',
  csw: 'CSW (Solicitudes)',
  approval_flows: 'Flujos de Aprobación',
  training: 'Capacitaciones',
};

// Mapeo de acciones a nombres en español
const actionNames: Record<string, string> = {
  read: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
  approve: 'Aprobar',
  cancel: 'Cancelar',
};

const RoleFormModal = observer(({ isOpen, onClose, roleId }: RoleFormModalProps) => {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!roleId;

  // Cargar permisos disponibles
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  // Cargar datos del rol en modo edición
  useEffect(() => {
    if (isOpen && isEditMode && roleId) {
      loadRoleData();
    } else if (isOpen && !isEditMode) {
      // Limpiar formulario en modo creación
      setName("");
      setSelectedPermissions([]);
      setError(null);
    }
  }, [isOpen, isEditMode, roleId]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setSelectedPermissions([]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const permissions = await permissionsService.getAll();
      console.log('Permisos cargados:', permissions);
      // Asegurar que siempre sea un array
      setAvailablePermissions(Array.isArray(permissions) ? permissions : []);
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      setError("Error al cargar los permisos");
      setAvailablePermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const loadRoleData = async () => {
    if (!roleId) return;
    
    try {
      // Obtener el rol desde el store o hacer fetch si no existe
      let role = rolesStore.roles.find((r) => r._id === roleId);
      
      if (!role) {
        await rolesStore.fetchRoleById(roleId);
        role = rolesStore.selectedRole || undefined;
      }
      
      if (role) {
        setName(role.name);
        // Los permisos pueden venir como objetos o como IDs
        const permissionIds = role.permissions.map((p) => 
          typeof p === 'string' ? p : p._id
        );
        setSelectedPermissions(permissionIds);
      }
    } catch (err) {
      console.error('Error al cargar datos del rol:', err);
      setError('Error al cargar los datos del rol');
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedPermissions([]);
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInResource = (resource: string) => {
    const resourcePermissions = availablePermissions
      .filter((p) => p.resource === resource)
      .map((p) => p._id);

    const allSelected = resourcePermissions.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      // Deseleccionar todos
      setSelectedPermissions((prev) =>
        prev.filter((id) => !resourcePermissions.includes(id))
      );
    } else {
      // Seleccionar todos
      setSelectedPermissions((prev) => {
        const newIds = resourcePermissions.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
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

      if (isEditMode && roleId) {
        await rolesStore.updateRole(roleId, roleData);
      } else {
        await rolesStore.createRole(roleData);
      }

      await rolesStore.fetchRoles();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agrupar permisos por recurso
  const groupedPermissions = Array.isArray(availablePermissions)
    ? availablePermissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>)
    : {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="relative w-full max-w-[800px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Editar Rol" : "Nuevo Rol"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditMode
            ? "Actualiza la información del rol"
            : "Crea un nuevo rol con permisos específicos"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Nombre del Rol */}
        <div>
          <Label htmlFor="roleName">Nombre del Rol</Label>
          <input
            id="roleName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: ADMINISTRADOR"
            className="w-full h-11 rounded-lg border appearance-none px-3.5 py-2.5 text-theme-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            disabled={isSubmitting}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            El nombre se convertirá automáticamente a mayúsculas
          </p>
        </div>

        {/* Permisos */}
        <div>
          <Label>Permisos</Label>
          {loadingPermissions ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-300 rounded-full border-t-brand-600 animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-4">
              {Object.entries(groupedPermissions).map(([resource, permissions]) => {
                const allSelected = permissions.every((p) =>
                  selectedPermissions.includes(p._id)
                );

                return (
                  <div
                    key={resource}
                    className="pb-4 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0 dark:border-gray-700"
                  >
                    {/* Resource Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        📁 {resourceNames[resource] || resource}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAllInResource(resource)}
                        className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        disabled={isSubmitting}
                      >
                        {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                      </button>
                    </div>

                    {/* Permissions Checkboxes */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {permissions.map((permission) => (
                        <label
                          key={permission._id}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            selectedPermissions.includes(permission._id)
                              ? "bg-brand-50 dark:bg-brand-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission._id)}
                            onChange={() => handlePermissionToggle(permission._id)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {actionNames[permission.action] || permission.action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Seleccionados: {selectedPermissions.length} de {availablePermissions.length}
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
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
    </Modal>
  );
});

export default RoleFormModal;

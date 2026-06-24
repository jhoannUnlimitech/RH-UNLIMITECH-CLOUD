/**
 * Componente de botones de acción para tablas con control de permisos
 */

import { usePermissions } from '../../hooks/usePermissions';
import { PermissionResource } from '../../utils/permissions';
import { PencilIcon, TrashBinIcon, EyeIcon } from '../../icons';

interface TableActionsProps {
  resource: PermissionResource;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
}

/**
 * Renderiza botones de acción (ver, editar, eliminar) según los permisos del usuario
 * Solo muestra los botones para los cuales el usuario tiene permiso
 */
export const TableActions = ({
  resource,
  onView,
  onEdit,
  onDelete,
  viewTitle = 'Ver detalles',
  editTitle = 'Editar',
  deleteTitle = 'Eliminar',
}: TableActionsProps) => {
  const { can } = usePermissions();

  const canRead = can(resource, 'read');
  const canUpdate = can(resource, 'update');
  const canDelete = can(resource, 'delete');

  // Si no tiene ningún permiso, no mostrar nada
  if (!canRead && !canUpdate && !canDelete) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Botón Ver - solo si tiene permiso de lectura y hay callback */}
      {canRead && onView && (
        <button
          onClick={onView}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          title={viewTitle}
        >
          <EyeIcon className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* Botón Editar - solo si tiene permiso de actualización y hay callback */}
      {canUpdate && onEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
          title={editTitle}
        >
          <PencilIcon className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* Botón Eliminar - solo si tiene permiso de eliminación y hay callback */}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]"
          title={deleteTitle}
        >
          <TrashBinIcon className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
};

/**
 * Componente de botón "Crear" con control de permisos
 */

import { usePermissions } from '../../hooks/usePermissions';
import { PermissionResource } from '../../utils/permissions';
import Button from '../ui/button/Button';

interface CreateButtonProps {
  resource: PermissionResource;
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Renderiza un botón de "Crear" solo si el usuario tiene permiso de creación
 */
export const CreateButton = ({
  resource,
  onClick,
  label = 'Crear Nuevo',
  icon,
  className = '',
}: CreateButtonProps) => {
  const { can } = usePermissions();

  // Solo mostrar si tiene permiso de crear
  if (!can(resource, 'create')) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      variant="primary"
      size="default"
      className={className}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Button>
  );
};
